'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PWAInstallPrompt } from './pwa-install-prompt';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleClick = () => {
    setShowPrompt(true);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        title="Install App"
        className="relative"
      >
        <Download className="h-5 w-5" />
      </Button>

      {showPrompt && (
        <PWAInstallPrompt 
          deferredPrompt={deferredPrompt}
          onClose={handleClose}
        />
      )}
    </>
  );
} 