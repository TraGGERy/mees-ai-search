import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Article {
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

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="text-sm bg-purple-500 text-white px-2 py-1 rounded">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{article.title}</h2>
          <p className="text-sm text-muted-foreground">
            {article.source} • {article.date}
          </p>
        </div>

        <p className={`text-muted-foreground ${!showFullSummary && "line-clamp-3"}`}>
          {article.summary}
        </p>

        {article.summary.length > 150 && (
          <Button
            variant="link"
            onClick={() => setShowFullSummary(!showFullSummary)}
            className="p-0 h-auto text-purple-500 flex items-center"
          >
            {showFullSummary ? (
              <>
                Show less <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        )}

        <div className="flex items-center space-x-2 pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Summary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI-Generated Summary</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <p className="text-muted-foreground">{article.aiSummary}</p>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => window.open(article.url, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Read Original
          </Button>
        </div>
      </div>
    </Card>
  );
}