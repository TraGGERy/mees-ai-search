'use client';

import { Button } from './ui/button';
import Image from 'next/image';
import { useState } from 'react';

interface PWAInstallPromptProps {
  deferredPrompt: any;
  onClose: () => void;
}

export function PWAInstallPrompt({ deferredPrompt, onClose }: PWAInstallPromptProps) {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallClick = async () => {
    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      onClose();
    } catch (error) {
      console.error('Error during installation:', error);
      onClose();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />

  {/* Modal */}
  <div className="absolute left-1/2 top-[700%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
    <div className="bg-white dark:bg-gray-900 rounded-lg w-full p-4 shadow-xl">
      <div className="flex items-start gap-4">
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

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="relative h-40 rounded-lg overflow-hidden border dark:border-gray-700">
                <Image
                  src="/screenshots/mobile.png"
                  alt="Mobile view"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">Mobile View</p>
            </div>
            <div>
              <div className="relative h-40 rounded-lg overflow-hidden border dark:border-gray-700">
                <Image
                  src="/screenshots/desktop.png"
                  alt="Desktop view"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">Desktop View</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick} 
              className="flex-1"
              disabled={isInstalling}
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  );
} 