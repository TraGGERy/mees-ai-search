'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PWAInstallPrompt } from './pwa-install-prompt';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    // Check if browser is Chrome
    const isChromeBrowser = /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
    setIsChrome(isChromeBrowser);
    
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already installed');
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    console.log('Is iOS device:', isIOSDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      console.log('Before install prompt event captured');
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    const handleAppInstalled = (e: Event) => {
      console.log('App was installed:', e);
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstalling(false);
      setIsInstalled(true);
    };

    if (!checkInstalled()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Log if the app is already installable
      console.log('Install button initialized, waiting for beforeinstallprompt event');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    console.log('Install button clicked, deferredPrompt:', !!deferredPrompt);
    
    if (isChrome && deferredPrompt) {
      // For Chrome, trigger the native install prompt
      try {
        setIsInstalling(true);
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User choice:', outcome);
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (error) {
        console.error('Installation error:', error);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    } else {
      // For other browsers, show our custom prompt
      setShowPrompt(true);
    }
  };

  const handleClose = () => {
    console.log('Install prompt closed');
    setShowPrompt(false);
    setIsInstalling(false);
  };

  // Don't show the install button if the app is already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        title="Install App"
        className="relative"
        disabled={isInstalling}
      >
        <Download className="h-5 w-5" />
      </Button>

      {showPrompt && !isChrome && (
        <PWAInstallPrompt 
          deferredPrompt={deferredPrompt}
          onClose={handleClose}
          isInstalling={isInstalling}
          setIsInstalling={setIsInstalling}
        />
      )}
    </>
  );
} 