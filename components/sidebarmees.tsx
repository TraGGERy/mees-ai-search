"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/setui/ui/button";
import { ScrollArea } from "@/components/setui/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/setui/ui/sheet";
import { Home, Search, Settings, Menu, Star, ChevronRight, MessageSquare, FileText, Upload, X, ChevronLeft, ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { db } from "@/db/db";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IconDeviceMobile } from "@tabler/icons-react";
import { SiFacebook, SiWhatsapp, SiX } from "react-icons/si";
import { ClientHistoryList } from './client-history-list';

interface SidebarProps {
  className?: string;
}

export function Sidebarmees({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, isSignedIn } = useUser();
  const [email, setEmail] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    currentPlan: string;
    subscriptionStatus: string;
    nextInvoiceDate: string | null;
    invoicePdfUrl: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchEmail = async () => {
        try {
          const clerkUserId = user.id;
          const subscription = await db
            .select({ email: userSubscriptions.email })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.clerkUserId, clerkUserId))
            .limit(1);
          setEmail(subscription[0]?.email || "Email not found");
        } catch (error) {
          console.error("Error fetching user email:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEmail();
    }
  }, [user]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;
      try {
        const subscription = await db
          .select({
            currentPlan: userSubscriptions.currentPlan,
            subscriptionStatus: userSubscriptions.subscriptionStatus,
            nextInvoiceDate: userSubscriptions.nextInvoiceDate,
            invoicePdfUrl: userSubscriptions.invoicePdfUrl,
          })
          .from(userSubscriptions)
          .where(eq(userSubscriptions.clerkUserId, user.id))
          .limit(1);

        if (subscription.length > 0) {
          const {
            currentPlan,
            subscriptionStatus,
            nextInvoiceDate,
            invoicePdfUrl,
          } = subscription[0];

          setSubscriptionData({
            currentPlan: currentPlan || "No Plan",
            subscriptionStatus: subscriptionStatus || "Inactive",
            nextInvoiceDate: nextInvoiceDate ? nextInvoiceDate.toISOString() : null,
            invoicePdfUrl: invoicePdfUrl || null,
          });
        } else {
          setSubscriptionData({
            currentPlan: "No Plan",
            subscriptionStatus: "Inactive",
            nextInvoiceDate: null,
            invoicePdfUrl: null,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        setSubscriptionData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscriptionData();
  }, [user]);  

  const routes = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Discover Articles", icon: FileText, href: "/discover" },
    { label: "Chat", icon: MessageSquare, href: "/chat" },
  ];

  // Mock chat history data
  const chatHistory = [
    { id: 1, message: "Hello! How can I help you today?", isUser: false },
    { id: 2, message: "I have a question about AI.", isUser: true },
    { id: 3, message: "Sure, what would you like to know?", isUser: false },
    // Add more mock messages as needed
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    } else {
      setIsExpanded(false);
    }
  };

  const SidebarContent = () => (
    <div className={cn(
      "flex h-full flex-col bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out overflow-hidden",
      isExpanded ? "w-64" : "w-16"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">Mees AI</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="ml-auto">
          {isExpanded ? <ChevronLeftCircle className="h-6 w-6" /> : <ChevronRightCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-grow">
        <div className="px-3 py-2">
          <nav className="space-y-1 mb-4">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} onClick={handleLinkClick}>
                <div
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors",
                    pathname === route.href
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <route.icon className="h-5 w-5" />
                    {isExpanded && route.label}
                  </div>
                  {isExpanded && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </Link>
            ))}
          </nav>

          {/* Chat History */}
          {isExpanded && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-4 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Recent Chats</h3>
              </div>
              
              <div className="px-2">
                {isSignedIn ?
                <ClientHistoryList />
               :<p>login to see history</p>
                }
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Mees AI Pro Section */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5" />
              <span className="font-semibold">Mees AI Pro</span>
            </div>
            <p className="text-sm mb-3">
              Unlock advanced features and boost your productivity.
            </p>
            <Button className="w-full bg-white text-purple-700 hover:bg-gray-100">
              {isSignedIn ? "Upgrade Now" : "Learn More"}
            </Button>
          </div>
        </div>
      )}

      {/* User Info and Settings */}
      {isSignedIn && isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-900 dark:text-purple-100">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {user?.fullName || "John Doe"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {subscriptionData?.currentPlan || "Free Plan"}
              </div>
            </div>
            <Link href="/settings" onClick={handleLinkClick}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-purple-600" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Social Links */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <IconDeviceMobile className="h-5 w-5" />
            <span className="text-sm">Download</span>
            <div className="flex gap-2 ml-auto">
              <Link href="https://twitter.com/Mees_nz" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                <SiX className="h-5 w-5" />
              </Link>
              <Link href="https://facebook.com/profile.php?id=100090089754837&mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                <SiFacebook className="h-5 w-5" />
              </Link>
              <Link href="https://whatsapp.com/channel/0029VafFHO8IyPtbwtGq7K1G" target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
                <SiWhatsapp className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6 text-purple-600" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="p-0 w-[280px] h-full overflow-hidden"
          style={{ background: 'transparent', boxShadow: 'none' }}
        >
          <div className="h-[100vh] w-full bg-white dark:bg-gray-900 overflow-hidden">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      <aside className={cn("hidden lg:block h-screen fixed top-0 left-0 z-30", className)}>
        <SidebarContent />
      </aside>
    </>
  );
}


