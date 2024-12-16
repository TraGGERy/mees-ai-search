"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface QAInterfaceProps {
  documentContext: any;
}

export default function QAInterface({ documentContext }: QAInterfaceProps) {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newQuestion = { role: "user", content: question };
    setConversation(prev => [...prev, newQuestion]);
    setQuestion("");
    setIsLoading(true);

    // Simulated AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const aiResponse = {
      role: "assistant",
      content: "This is a simulated AI response based on the document context..."
    };
    
    setConversation(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="h-[300px] overflow-y-auto space-y-4 mb-4">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-secondary"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the document..."
            className="min-h-[60px]"
          />
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}