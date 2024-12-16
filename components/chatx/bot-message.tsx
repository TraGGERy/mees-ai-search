"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content]);

  return (
    <div ref={messageRef} className="text-sm whitespace-pre-wrap">
      {content}
    </div>
  );
}