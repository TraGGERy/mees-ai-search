'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import { X } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Install Mees AI</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowInstallPrompt(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Features */}
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Fast AI-powered search and chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Native app-like experience</span>
            </div>
          </div>

          {/* Screenshots */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="space-y-2">
              <div className="relative h-[400px] rounded-lg overflow-hidden border dark:border-gray-800">
                <Image
                  src="/screenshots/mobile.png"
                  alt="Mobile view"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-center text-gray-500">Mobile View</p>
            </div>
            <div className="space-y-2">
              <div className="relative h-[400px] rounded-lg overflow-hidden border dark:border-gray-800">
                <Image
                  src="/screenshots/desktop.png"
                  alt="Desktop view"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-center text-gray-500">Desktop View</p>
            </div>
          </div>

          {/* Install button */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleInstallClick}
              className="w-full py-6 text-lg"
              size="lg"
            >
              Install Mees AI
            </Button>
            <p className="text-xs text-center text-gray-500">
              Install Mees AI for a faster, app-like experience with offline support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 