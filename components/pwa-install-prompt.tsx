'use client';

import { Button } from './ui/button';
import Image from 'next/image';

interface PWAInstallPromptProps {
  deferredPrompt: any;
  onClose: () => void;
  isInstalling: boolean;
  setIsInstalling: (installing: boolean) => void;
}

export function PWAInstallPrompt({ 
  deferredPrompt, 
  onClose, 
  isInstalling, 
  setIsInstalling 
}: PWAInstallPromptProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  const handleInstallClick = async () => {
    console.log('Install clicked, isIOS:', isIOS);
    
    if (isIOS) {
      console.log('iOS device detected, showing instructions');
      onClose();
      return;
    }

    if (!deferredPrompt) {
      console.log('No installation prompt available');
      setIsInstalling(false);
      onClose();
      return;
    }

    try {
      console.log('Starting installation process');
      setIsInstalling(true);

      // Show the installation prompt
      console.log('Triggering prompt');
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      console.log('Waiting for user choice');
      const choiceResult = await deferredPrompt.userChoice;
      console.log('User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('Installation accepted');
        // The app was installed successfully
        onClose();
      } else {
        console.log('Installation rejected');
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Error during installation:', error);
      setIsInstalling(false);
    } finally {
      // Always clear the deferred prompt after using it
      (window as any).deferredPrompt = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm p-4 shadow-xl">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold">Install Mees AI app</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Publisher: https://wwww.mees-ai.co.zw/home
            </p>
          </div>

          {isIOS ? (
            <div className="text-sm">
              <p>To install this app on iOS:</p>
              <ul className="list-decimal pl-5 space-y-1 mt-1">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; to confirm</li>
              </ul>
            </div>
          ) : (
            <div className="text-sm">
              <p>Use this site often? Install the app which:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Opens in a focused window</li>
                <li>Has quick access options like pin to taskbar</li>
                <li>Syncs across multiple devices</li>
              </ul>
            </div>
          )}

          <div className="relative h-40 rounded-lg overflow-hidden border dark:border-gray-700">
            <Image
              src="/screenshots/mobile.png"
              alt="App preview"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick} 
              className="flex-1"
              disabled={isInstalling}
            >
              {isInstalling ? "Installing..." : isIOS ? "Got it" : "Install"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isInstalling}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

