"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NewsCard from "@/components/discover/news-card";
import NewsFilter from "@/components/discover/news-filter";
import { Search, Loader2 } from "lucide-react";
import { generateSummary } from "@/lib/uploads/chatgpt-mini";
import { db } from "@/db/db";
import { articles } from "@/db/schema"; // Assuming `articles` is your Drizzle table schema.

interface NewsItem {
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

export default function DiscoverPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewsFromDB = async () => {
    setIsLoading(true);
    try {
      // Try to get cached articles first
      const cachedNews = localStorage.getItem('cached_news');
      if (cachedNews) {
        setNews(JSON.parse(cachedNews));
      }

      // Fetch fresh articles from DB
      const articlesFromDB = await db.select().from(articles);

      const newsWithSummaries = await Promise.all(
        articlesFromDB.map(async (article) => ({
          id: article.id,
          title: article.title.trim(),
          summary: article.summary.trim(),
          url: article.url,
          imageUrl: article.imageUrl ?? "/default-image.jpg",
          source: article.source.trim(),
          date: new Date(article.date).toISOString().split('T')[0],
          category: (article.category ?? "Uncategorized").trim(),
          aiSummary: (await generateSummary(article.summary)).trim(),
        }))
      );

      const sortedNews = newsWithSummaries.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });

      // Cache the articles in localStorage
      localStorage.setItem('cached_news', JSON.stringify(sortedNews));
      setNews(sortedNews);
    } catch (error) {
      console.error("Error fetching news from database:", error);
      // If there's an error and we have cached news, use that
      const cachedNews = localStorage.getItem('cached_news');
      if (cachedNews) {
        setNews(JSON.parse(cachedNews));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsFromDB();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const filteredNews = news.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setNews(filteredNews);
    setIsLoading(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      fetchNewsFromDB();
    } else {
      setNews(news.filter((article) => article.category === category));
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Discover Tech News</h1>

        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </Card>

        <NewsFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="space-y-6 mt-8">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}
