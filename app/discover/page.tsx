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
      const articlesFromDB = await db.select().from(articles);
      
      // Move the sorting to the database query for better performance
      const newsWithSummaries = await Promise.all(
        articlesFromDB
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(async (article) => ({
            id: article.id,
            title: article.title,
            summary: article.summary,
            url: article.url,
            imageUrl: article.imageUrl ?? "/default-image.jpg",
            source: article.source,
            date: new Date(article.date).toLocaleDateString(),
            category: article.category ?? "Uncategorized",
            aiSummary: await generateSummary(article.summary),
          }))
      );

      setNews(newsWithSummaries);
    } catch (error) {
      console.error("Error fetching news from database:", error);
      // Provide user feedback
      alert("Failed to fetch news. Please try again later.");
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsFromDB();
  }, []);

  // Debounce function for search input
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = debounce((e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const filteredNews = news.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setNews(filteredNews);
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

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
