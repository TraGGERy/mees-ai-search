'use client';

import { Button } from './ui/button';
import Image from 'next/image';

interface PWAInstallPromptProps {
  deferredPrompt: any;
  onClose: () => void;
}

export function PWAInstallPrompt({ deferredPrompt, onClose }: PWAInstallPromptProps) {
  const handleInstallClick = async () => {
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      onClose();
    } catch (error) {
      console.error('Error during installation:', error);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm p-4 shadow-xl">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold">Install Mees AI app</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Publisher: https://wwww.mees-ai.co.zw/home
            </p>
          </div>

          <div className="text-sm">
            <p>Use this site often? Install the app which:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Opens in a focused window</li>
              <li>Has quick access options like pin to taskbar</li>
              <li>Syncs across multiple devices</li>
            </ul>
          </div>

          <div className="relative h-40 rounded-lg overflow-hidden border dark:border-gray-700">
            <Image
              src="/screenshots/mobile.png"
              alt="App preview"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1">
              Install
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

