import { db } from "@/db/db";
import { articles } from "@/db/schema";
import { generateSummary } from "@/lib/uploads/chatgpt-mini";
import { toast } from "sonner";
import Parser from 'rss-parser';

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  source: string;
  date: string;
  category: string;
  aiSummary: string;
}

interface RSSItem {
  title: string;
  link: string;
  content: string;
  description?: string;
  contentSnippet?: string;
  pubDate: string;
  'content:encoded'?: string;
  'media:content'?: { $: { url: string } };
}

export class NewsAgent {
  private static instance: NewsAgent;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(news: NewsItem[]) => void> = new Set();
  private cachedNews: NewsItem[] = [];
  private isRunning: boolean = false;
  private parser: Parser;
  
  // Update twice a day (12 hours in milliseconds)
  private readonly UPDATE_INTERVAL = 12 * 60 * 60 * 1000;

  // RSS Feed URLs
  private readonly RSS_FEEDS = {
    techcrunch: 'https://techcrunch.com/feed/',
    techzim: 'https://www.techzim.co.zw/feed/'
  };

  private constructor() {
    console.log('NewsAgent: Initializing...');
    this.parser = new Parser();
    this.startAutoUpdate();
  }

  public static getInstance(): NewsAgent {
    if (!NewsAgent.instance) {
      console.log('NewsAgent: Creating new instance');
      NewsAgent.instance = new NewsAgent();
    }
    return NewsAgent.instance;
  }

  private async startAutoUpdate() {
    if (this.isRunning) {
      console.log('NewsAgent: Already running');
      return;
    }
    
    console.log('NewsAgent: Starting auto-update');
    this.isRunning = true;
    
    // Initial fetch
    await this.updateNews();
    console.log('NewsAgent: Initial fetch completed');

    // Set up interval for updates
    this.updateInterval = setInterval(() => {
      this.updateNews();
    }, this.UPDATE_INTERVAL);
  }

  private async fetchRSSFeed(url: string, source: string): Promise<NewsItem[]> {
    console.log(`NewsAgent: Fetching ${source} feed from ${url}`);
    try {
      const feed = await this.parser.parseURL(url);
      console.log(`NewsAgent: Successfully fetched ${source} feed`);
      
      return await Promise.all(
        feed.items.map(async (item: RSSItem) => {
          const description = item.contentSnippet || 
                            item.description || 
                            this.stripHtmlTags(item.content) || 
                            '';

          const newsItem: NewsItem = {
            id: this.generateId(item.link || ''),
            title: item.title || '',
            summary: description.substring(0, 500),
            url: item.link || '',
            imageUrl: this.extractImageFromContent(item['content:encoded'] || item.content) || '/default-image.jpg',
            source: source,
            date: new Date(item.pubDate).toLocaleDateString(),
            category: this.categorizeArticle(item.title || ''),
            aiSummary: await generateSummary(description)
          };

          return newsItem;
        })
      );
    } catch (error) {
      console.error(`NewsAgent: Error fetching ${source} feed:`, error);
      return [];
    }
  }

  private async updateNews() {
    console.log('NewsAgent: Starting news update');
    try {
      const [techcrunchNews, techzimNews] = await Promise.all([
        this.fetchRSSFeed(this.RSS_FEEDS.techcrunch, 'TechCrunch'),
        this.fetchRSSFeed(this.RSS_FEEDS.techzim, 'TechZim')
      ]);

      this.cachedNews = [...techcrunchNews, ...techzimNews]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      await this.saveToDatabase();
      this.notifySubscribers();
      
      console.log(`NewsAgent: Update completed with ${this.cachedNews.length} articles`);
      toast.success('News updated successfully');
    } catch (error) {
      console.error("NewsAgent: Error updating news:", error);
      toast.error("Failed to update news");
    }
  }

  private async saveToDatabase() {
    console.log('NewsAgent: Saving to database');
    try {
      for (const article of this.cachedNews) {
        await db.insert(articles).values({
          title: article.title,
          summary: article.summary,
          url: article.url,
          imageUrl: article.imageUrl,
          source: article.source,
          category: article.category,
          date: new Date(article.date),
        }).onConflictDoNothing();
      }
      console.log('NewsAgent: Database save completed');
    } catch (error) {
      console.error("NewsAgent: Error saving to database:", error);
    }
  }

  private generateId(url: string): number {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private stripHtmlTags(html: string = ''): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private extractImageFromContent(content: string = ''): string | null {
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
  }

  private categorizeArticle(title: string): string {
    const categories = {
      AI: ['ai', 'artificial intelligence', 'machine learning', 'ml'],
      Crypto: ['crypto', 'bitcoin', 'blockchain', 'nft'],
      Startups: ['startup', 'funding', 'venture', 'series'],
      Mobile: ['android', 'ios', 'mobile', 'app'],
    };

    const lowercaseTitle = title.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowercaseTitle.includes(keyword))) {
        return category;
      }
    }
    return 'General';
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.cachedNews));
  }

  public subscribe(callback: (news: NewsItem[]) => void) {
    this.subscribers.add(callback);
    if (this.cachedNews.length > 0) {
      callback(this.cachedNews);
    }
    return () => this.unsubscribe(callback);
  }

  private unsubscribe(callback: (news: NewsItem[]) => void) {
    this.subscribers.delete(callback);
  }

  public getNews(): NewsItem[] {
    return this.cachedNews;
  }
} 