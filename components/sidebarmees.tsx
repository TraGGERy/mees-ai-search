"use client";

import { useState, useEffect, useCallback, memo } from "react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/setui/ui/button";
import { ScrollArea } from "@/components/setui/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/setui/ui/sheet";
import { Home, Menu, ChevronRight, MessageSquare, FileText, ChevronLeftCircle, ChevronRightCircle, User, Sparkles, Settings, Twitter, Github, Download } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import Image from "next/image";
import { SiFacebook, SiWhatsapp } from "react-icons/si";

// Lazy load heavy components
const ClientHistoryList = dynamic(() => import('./client-history-list').then(mod => mod.ClientHistoryList), {
  loading: () => <div className="animate-pulse h-20 bg-gray-100 dark:bg-gray-800 rounded-md" />
});

const NavLink = ({ route, isExpanded, isActive, onClick }: {
  route: { label: string; icon: any; href: string };
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Link
    href={route.href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
      isActive ? "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
    )}
  >
    <route.icon className="h-5 w-5" />
    {isExpanded && <span>{route.label}</span>}
  </Link>
);

export function Sidebarmees({ className }: { className?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, isSignedIn } = useUser();

  const routes = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Discover Articles", icon: FileText, href: "/discover" },
    { label: "Chat", icon: MessageSquare, href: "/chat" },
    ...(isSignedIn ? [{ label: "Settings", icon: Settings, href: "/settings" }] : []),
  ] as const;

  // Memoize handlers
  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
      setIsExpanded(false);
      localStorage.setItem('sidebarExpanded', 'false');
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarExpanded', String(newState));
      return newState;
    });
  }, []);

  // Handle mobile view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Move localStorage check to useEffect
  useEffect(() => {
    const savedExpanded = localStorage.getItem('sidebarExpanded');
    if (savedExpanded !== null) {
      setIsExpanded(savedExpanded === 'true');
    }
  }, []);

  // Memoize SidebarContent
  const SidebarContent = memo(() => (
    <div className={cn(
      "flex h-full flex-col bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out",
      isExpanded ? "w-64" : "w-16"
    )}>
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            {user?.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt="Profile" 
                width={32} 
                height={32} 
                className="rounded-full"
              />
            ) : (
              <User className="w-8 h-8 text-gray-500" />
            )}
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
              </div>
            )}
          </div>
        ) : (
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">Sign In</Button>
          </SignInButton>
        )}
      </div>

      <ScrollArea className="flex-grow">
        <div className="px-3 py-2">
          <nav className="space-y-1 mb-4">
            {routes.map(route => (
              <NavLink
                key={route.href}
                route={route}
                isExpanded={isExpanded}
                isActive={pathname === route.href}
                onClick={handleLinkClick}
              />
            ))}
          </nav>

          {isExpanded && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Recent Chats</span>
              </div>
              
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="px-2 space-y-1">
                  {isSignedIn ? (
                    <ClientHistoryList />
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-2 px-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                      Sign in to see your chat history
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {isExpanded ? (
          <div className="space-y-4">
            {/* Social Links */}
            <div className="flex justify-around">
              <Link href="https://x.com/Mees_nz" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://www.whatsapp.com/channel/0029VafFHO8IyPtbwtGq7K1G" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                <SiWhatsapp className="h-5 w-5" />
              </Link>
              <Link href="https://www.facebook.com/people/Mees/100090089754837/?mibextid=LQQJ4d" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                <SiFacebook className="h-5 w-5" />
              </Link>
          
            </div>
            {/* Download Button */}
            <Button variant="outline" className="w-full" onClick={() => window.open('/download', '_blank')}>
              <Download className="h-4 w-4 mr-2" />
              Download App
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="w-full" onClick={() => window.open('/download', '_blank')}>
            <Download className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  ));
  SidebarContent.displayName = 'SidebarContent';

  if (['/admin', '/home', '/admin/dashboard','/chat'].includes(pathname)) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-2 left-2 z-50 lg:hidden"
        onClick={() => {
          setIsOpen(true);
          setIsExpanded(true);
        }}
      >
        <Menu className="h-6 w-6 text-purple-600" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64 mt-14">
          <div className="relative h-full">
            <SidebarContent />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isExpanded ? <ChevronLeftCircle className="h-4 w-4" /> : <ChevronRightCircle className="h-4 w-4" />}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <aside className={cn("hidden lg:block h-screen fixed top-0 left-0 z-30", className)}>
        <div className="relative">
          <SidebarContent />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpanded}
            className="absolute -right-3 top-6 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isExpanded ? <ChevronLeftCircle className="h-4 w-4" /> : <ChevronRightCircle className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </>
  );
}

