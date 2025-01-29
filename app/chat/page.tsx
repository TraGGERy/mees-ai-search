"use client";

import { useChat } from "ai/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Bot, Send, User, ChevronDown, ChevronUp, Copy, BookOpen, GraduationCap, Smile, Wheat, Code, Palette, BarChart, Cpu, Stethoscope, BadgeDollarSign, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { nanoid } from "nanoid";
import { personas, Persona } from '@/types/chat';
import { IconCode } from "@tabler/icons-react";
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import { db } from "@/db/db";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PricingPopup } from '@/components/PricingPopup';

interface ChatHistory {
  chatId: string;
  title: string;
  messages: any[];
  createdAt: string;
  userId: string;
}

export default function ChatComponent() {
  const { user } = useUser();
  const [error, setError] = useState<Error | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('currentChatId') || nanoid();
    }
    return nanoid();
  });
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [personaMessages, setPersonaMessages] = useState<{ [key: string]: any[] }>({});
  const [showPricing, setShowPricing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      chatId: currentChatId,
      systemPrompt: selectedPersona.systemPrompt
    },
    id: currentChatId,
    initialMessages: [],
    onError: (error) => {
      setError(error);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    sessionStorage.setItem('currentChatId', currentChatId);
  }, [currentChatId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [messages.length]);

  const loadChat = (chat: ChatHistory) => {
    setCurrentChatId(chat.chatId);
    sessionStorage.setItem('currentChatId', chat.chatId);
    setMessages(chat.messages);
    setIsHistoryOpen(false);
  };

  const startNewChat = () => {
    const newChatId = nanoid();
    setCurrentChatId(newChatId);
    sessionStorage.setItem('currentChatId', newChatId);
    setMessages([]);
  };

  const handleNewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setPersonaMessages(prev => ({
        ...prev,
        [selectedPersona.id]: messages
      }));
    }
  }, [messages, selectedPersona.id]);

  useEffect(() => {
    const saved = localStorage.getItem('personaMessages');
    if (saved) {
      const savedMessages = JSON.parse(saved);
      setPersonaMessages(savedMessages);
      if (savedMessages[selectedPersona.id]) {
        setMessages(savedMessages[selectedPersona.id]);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(personaMessages).length > 0) {
      localStorage.setItem('personaMessages', JSON.stringify(personaMessages));
    }
  }, [personaMessages]);

  const handlePersonaChange = (persona: Persona) => {
    setSelectedPersona(persona);
    setIsDropdownOpen(false);
    
    if (personaMessages[persona.id]) {
      setMessages(personaMessages[persona.id]);
    } else {
      setMessages([]);
      setPersonaMessages(prev => ({
        ...prev,
        [persona.id]: []
      }));
    }
  };

  const handleReasoning = async (messageContent: string) => {
    const loadingId = nanoid();
    const deepThinker = personas.find(p => p.id === 'deepThinker');
    let contentBuffer = '';
    const decoder = new TextDecoder();

    try {
      setMessages(prev => [
        ...prev,
        {
          id: loadingId,
          role: 'assistant',
          content: `## 🧠 Deep Analysis in Progress\n\nAnalyzing content...`,
          createdAt: new Date()
        }
      ]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are an advanced AI analyst. Provide clear, well-structured analysis using this format:

## 🧠 Analysis Title

Brief introduction of the topic.

### Key Points
- First key point with explanation
- Second key point with explanation
- Third key point with explanation

### Details
Important details and explanations go here, broken into clear paragraphs.

### Summary
Concise summary of the main findings and implications.`
            },
            {
              role: 'user',
              content: `Please analyze this in detail:\n\n${messageContent}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const reader = response.body?.getReader();
      let updateTimeout: NodeJS.Timeout;

      const updateContent = (content: string) => {
        const cleanContent = content
          .replace(/\\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/\*\\\*/g, '*')
          .replace(/\\\*/g, '*')
          .replace(/\s+\n/g, '\n')
          .replace(/\n\s+/g, '\n')
          .trim();

        setMessages(prev => 
          prev.map(msg => 
            msg.id === loadingId ? { ...msg, content: cleanContent } : msg
          )
        );
      };

      const debouncedUpdate = (content: string) => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => updateContent(content), 100);
      };

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const matches = chunk.match(/0:"([^"]*)"/g);
        
        if (matches) {
          const content = matches
            .map(match => match.slice(3, -1))
            .join('');
          
          contentBuffer += content;
          debouncedUpdate(contentBuffer);
        }
      }

      updateContent(contentBuffer);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Deep thinking error:', error);
      toast.error('Analysis failed');
      setMessages(prev => prev.filter(m => m.id !== loadingId));
    }
  };

  const checkSubscription = async (userId: string, messageContent: string) => {
    try {
      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.clerkUserId, userId))
        .limit(1);

      console.log("Found subscription:", subscription);

      const userSub = subscription[0];
      
      if (userSub && userSub.currentPlan === 'AI_Agent') {
        toast.success('Active Subscription: AI Agent', {
          position: 'top-center'
        });
        handleReasoning(messageContent);
      } else if (userSub) {
        toast.error('Please upgrade to AI Agent plan to access this feature', {
          position: 'top-center'
        });
        setShowPricing(true);
      } else {
        toast.error('No active subscription found', {
          position: 'top-center'
        });
        setShowPricing(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status', {
        position: 'top-center'
      });
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToTop = useCallback(() => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollButton(isNotAtBottom);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  return (
    <div className="flex flex-col h-[100dvh] bg-inherit">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-semibold text-inherit">Mees AI</h1>
          </div>
        </div>
      </div>

      {/* Compact Dropdown Persona Selector */}
      <div className="flex-none p-2 border-b border-gray-200 dark:border-gray-800">
        <div className="relative max-w-[200px]">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedPersona.name}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaChange(persona)}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  {persona.id === 'researcher' && <BookOpen className="h-4 w-4 text-purple-500" />}
                  {persona.id === 'teacher' && <GraduationCap className="h-4 w-4 text-blue-500" />}
                  {persona.id === 'friend' && <Smile className="h-4 w-4 text-yellow-500" />}
                  {persona.id === 'farmer' && <Wheat className="h-4 w-4 text-green-500" />}
                  {persona.id === 'techGuru' && <Cpu className="h-4 w-4 text-indigo-500" />}
                  {persona.id === 'healthCoach' && <Stethoscope className="h-4 w-4 text-emerald-500" />}
                  {persona.id === 'financialAdvisor' && <BadgeDollarSign className="h-4 w-4 text-cyan-500" />}
                  
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{persona.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{persona.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3">
                <Bot className="h-12 w-12 mx-auto text-purple-600" />
                <h2 className="text-2xl font-semibold text-inherit">How can I help you today?</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">I&apos;m Mees AI, your research assistant.</p>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-8">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className="flex items-start gap-4 max-w-3xl">
                    {message.role === "assistant" ? (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {selectedPersona.id === 'researcher' && <BookOpen className="h-4 w-4 text-white" />}
                        {selectedPersona.id === 'teacher' && <GraduationCap className="h-4 w-4 text-white" />}
                        {selectedPersona.id === 'friend' && <Smile className="h-4 w-4 text-white" />}
                        {selectedPersona.id === 'farmer' && <Wheat className="h-4 w-4 text-white" />}
                        {selectedPersona.id === 'techGuru' && <Cpu className="h-4 w-4 text-white" />}
                        {selectedPersona.id === 'healthCoach' && <Stethoscope className="h-4 w-4 text-white" />}
                        {selectedPersona.id === 'financialAdvisor' && <BadgeDollarSign className="h-4 w-4 text-white" />}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-inherit">
                          {message.role === "assistant" ? selectedPersona.name : "You"}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none text-inherit dark:prose-invert bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 shadow-sm">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                        {message.role === "assistant" && (
                          <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 gap-2">
                            <motion.button
                              onClick={async () => {
                                if (!user) {
                                  toast.error('Please sign in', {
                                    position: 'top-center'
                                  });
                                  return;
                                }
                                await checkSubscription(user.id, message.content);
                              }}
                              className="relative group flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md px-2 py-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Deep analysis"
                            >
                              <motion.span
                                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"
                                animate={{
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              <motion.div
                                animate={{
                                  rotate: 360,
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              >
                                <Sparkles className="h-4 w-4 text-purple-500/50 group-hover:text-purple-500" />
                              </motion.div>
                            </motion.button>
                            <motion.button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(message.content);
                                  toast.success('Copied', {
                                    position: 'top-center'
                                  });
                                } catch (err) {
                                  const textArea = document.createElement('textarea');
                                  textArea.value = message.content;
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  try {
                                    document.execCommand('copy');
                                    toast.success('Copied', {
                                      position: 'top-center'
                                    });
                                  } catch (err) {
                                    toast.error('Failed to copy', {
                                      position: 'top-center'
                                    });
                                  }
                                  document.body.removeChild(textArea);
                                }
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label="Copy message"
                            >
                              <motion.div
                                whileHover={{ rotate: 12 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <Copy className="h-4 w-4 text-purple-500" />
                              </motion.div>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                    {selectedPersona.id === 'researcher' && <BookOpen className="h-4 w-4 text-white" />}
                    {selectedPersona.id === 'teacher' && <GraduationCap className="h-4 w-4 text-white" />}
                    {selectedPersona.id === 'friend' && <Smile className="h-4 w-4 text-white" />}
                    {selectedPersona.id === 'farmer' && <Wheat className="h-4 w-4 text-white" />}
                    {selectedPersona.id === 'techGuru' && <Cpu className="h-4 w-4 text-white" />}
                    {selectedPersona.id === 'healthCoach' && <Stethoscope className="h-4 w-4 text-white" />}
                    {selectedPersona.id === 'financialAdvisor' && <BadgeDollarSign className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-purple-600/50 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-purple-600/50 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Scroll anchor */}
        </div>
      </div>

      {/* Scroll Buttons */}
      <div className="fixed right-8 bottom-24 flex flex-col gap-2">
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="p-2 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      {/* Input Area */}
      <div className="flex-none border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleNewSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message Mees AI..."
              className="w-full rounded-lg pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-inherit placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-500 disabled:opacity-40 disabled:hover:text-gray-500"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      <PricingPopup 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)}
        onUpgrade={() => {
          // Handle upgrade logic if needed
          setShowPricing(false);
        }}
      />
    </div>
  );
}