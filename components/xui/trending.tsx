import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { db } from "@/db/db"; // Drizzle ORM database instance
import { articles } from "@/db/schema"; // Assuming you've set up the `articles` table schema in Drizzle
import { desc } from "drizzle-orm"; // Import the `desc` function for ordering

// Define a TypeScript interface for the article data
interface TrendingArticle {
  title: string;
  date: string;
  imageUrl: string | null; // Optional image URL
}

export function Trending() {
  const [isVisible, setIsVisible] = useState(false);
  const [articlesData, setArticlesData] = useState<TrendingArticle[]>([]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Fetch articles from the database
  const fetchArticles = async () => {
    try {
      // Fetch the last three articles, ordered by date (desc)
      const fetchedArticles = await db
        .select()
        .from(articles)
        .limit(3)
        .orderBy(desc(articles.date)); // Use `desc()` for descending order

      // Convert date to string (ISO format) and group articles by time
      const articlesWithStringDates = fetchedArticles.map((article) => ({
        ...article,
        date: article.date.toISOString(), // Convert Date to string
      }));

      setArticlesData(articlesWithStringDates);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  // Fetch articles when component is mounted
  useEffect(() => {
    fetchArticles();
  }, []);

  // Function to categorize the time into the appropriate range
  const categorizeTime = (articleDate: string): string => {
    const now = new Date();
    const articleTime = new Date(articleDate);
    const diffInHours = Math.floor((now.getTime() - articleTime.getTime()) / (1000 * 3600));

    if (diffInHours >= 1 && diffInHours <= 4) return "1-4 hours ago";
    if (diffInHours >= 6 && diffInHours <= 9) return "6-9 hours ago";
    return diffInHours >= 10 && diffInHours <= 23 ? "10-23 hours ago" : "Older";
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed inset-x-0 bottom-0 flex justify-center p-2">
        <button
          onClick={toggleVisibility}
          className="flex items-center space-x-1 rounded-full bg-zinc-900 text-white px-4 py-2 hover:bg-zinc-800"
        >
          {isVisible ? (
            <ChevronDown size={16} className="text-purple-700" />
          ) : (
            <ChevronUp size={16} className="text-purple-700" />
          )}
          <span>{isVisible ? "Hide Trending" : "Show Trending"}</span>
        </button>
      </div>

      {/* Trending Section */}
      {isVisible && (
        <div className="fixed inset-x-0 bottom-12 p-3 bg-background border-t border-zinc-800 shadow-lg">
          <div className="relative mx-auto max-w-2xl sm:max-w-3xl space-y-2">
            {/* Close Button */}
            <button
              onClick={toggleVisibility}
              className="absolute right-2 top-2 rounded-full p-1 bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <X size={16} />
            </button>

            {/* News List */}
            {articlesData.length > 0 ? (
              articlesData.map((item, index) => (
                
                <div key={index} className="flex items-start space-x-4 bg-zinc-900 p-3 rounded-md hover:bg-zinc-800">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 sm:w-32 sm:h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col justify-between">
                    <Link href="#" className="text-xs sm:text-sm font-semibold text-white">
                      {item.title}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-400">
                      <span>{categorizeTime(item.date)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-white">No trending articles available.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
