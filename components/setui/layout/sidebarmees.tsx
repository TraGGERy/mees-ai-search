"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/setui/ui/button";
import { ScrollArea } from "@/components/setui/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/setui/ui/sheet";
import { Home, Search, Settings, Menu, Star, ChevronRight, MessageSquare, FileText, Upload, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { db } from "@/db/db";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { IconDeviceMobile } from "@tabler/icons-react";
import { SiFacebook, SiWhatsapp, SiX } from "react-icons/si";

interface SidebarProps {
  className?: string;
}

export function Sidebarmees({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
    { label: "Upload", icon: Upload, href: "/upload" },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-inherit">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-purple-600" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Mees AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-6 w-6" />
        </Button>
      </div>


      {/* Navigation */}
      <ScrollArea className="flex-1 top-4">
        <nav className="space-y-2 px-3">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} onClick={() => setIsOpen(false)}>
              <div
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg text-sm font-medium transition",
                  pathname === route.href
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                    : "text-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Pro Upgrade */}
      <div className="p-4">
        <div className="rounded-lg bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 dark:from-purple-800/20 dark:to-purple-900/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-purple-700" />
            <span className="font-semibold text-purple-700 dark:text-purple-300">Try Mees AI Pro</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Unlock advanced features and boost your productivity.
          </p>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsOpen(false)}>
            {isSignedIn ? "Learn More" : "Upgrade Now"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      {isSignedIn && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-900">
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
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-purple-600" />
              </Button>
            </Link>
          </div>
        </div>
      )}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <IconDeviceMobile className="h-5 w-5" />
          <span className="text-sm">Download</span>
          <div className="flex gap-2 ml-auto">
            <Link href="https://twitter.com/Mees_nz" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
              <SiX className="h-5 w-5" />
            </Link>
            <Link href="https://facebook.com/profile.php?id=100090089754837&mibextid=LQQJ4d" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
              <SiFacebook className="h-5 w-5" />
            </Link>
            <Link href="https://whatsapp.com/channel/0029VafFHO8IyPtbwtGq7K1G" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)}>
              <SiWhatsapp className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6 text-purple-600" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 p-0 bg-inherit">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

