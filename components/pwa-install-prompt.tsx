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
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Image
              src="/icons/icon-192x192.png"
              alt="Mees AI"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Install Mees AI app</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Publisher: mees-ai-search.vercel.app
            </p>
            <div className="text-sm space-y-2 mb-4">
              <p>Use this site often? Install the app which:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Opens in a focused window</li>
                <li>Has quick access options like pin to taskbar</li>
                <li>Syncs across multiple devices</li>
              </ul>
            </div>
            
            {/* Screenshots */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="relative h-32 rounded overflow-hidden border dark:border-gray-700">
                  <Image
                    src="/screenshots/mobile.png"
                    alt="Mobile view"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">Mobile</p>
              </div>
              <div>
                <div className="relative h-32 rounded overflow-hidden border dark:border-gray-700">
                  <Image
                    src="/screenshots/desktop.png"
                    alt="Desktop view"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-500">Desktop</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                className="flex-1"
              >
                Install
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInstallPrompt(false)}
                className="flex-1"
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 