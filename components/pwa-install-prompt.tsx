'use client';

import { useState, useEffect } from 'react';
import { Button } from './setui/ui/button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // App is already installed
    }

    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      console.log('beforeinstallprompt fired');
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if the app was successfully installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('Error during installation:', error);
      setInstallError(error instanceof Error ? error.message : 'Failed to install app');
    }
  };

  // Force show the prompt for testing (remove in production)
  useEffect(() => {
    // Uncomment the next line to test the prompt
    // setShowInstallPrompt(true);
  }, []);

  if (installError) {
    return (
      <div className="text-red-600 p-2">
        <p>Installation failed: {installError}</p>
      </div>
    );
  }

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:w-80">
      <h3 className="text-lg font-semibold mb-2">Install Mees AI</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Install our app for a better experience
      </p>
      <div className="flex gap-2">
        <Button onClick={handleInstallClick} className="flex-1">
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
  );
} 