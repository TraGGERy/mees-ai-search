'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Apple, DownloadCloud, Share2, PlusCircle, Smartphone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

export function PWAInstallButton() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isIOSDialogOpen, setIsIOSDialogOpen] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Check if the app is already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://')
    
    setIsStandalone(standalone)

    // Detect iOS devices
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isAppleDevice)

    // If it's iOS and not installed, we'll show our custom button
    if (isAppleDevice && !standalone) {
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    // For iOS devices, show the installation instructions dialog
    if (isIOS) {
      setIsIOSDialogOpen(true)
      return
    }
    
    // For Android/desktop devices with install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt()

      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)

      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  // Don't show the button if the app is already installed
  if (isStandalone) {
    return null
  }

  return (
    <>
      {isInstallable && (
        <Button
          variant={isIOS ? "outline" : "default"}
          size="sm"
          onClick={handleInstallClick}
          className={`flex items-center gap-2 ${isIOS ? 'border-gray-300 bg-white text-black hover:bg-gray-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700' : 'bg-primary text-primary-foreground hover:bg-primary/90'} rounded-full shadow-sm transition-all duration-200 hover:shadow-md`}
        >
          {isIOS ? (
            <>
              <Apple className="w-4 h-4" />
              <span>Install App</span>
            </>
          ) : (
            <>
              <DownloadCloud className="w-4 h-4" />
              <span>Install App</span>
            </>
          )}
        </Button>
      )}

      <Dialog open={isIOSDialogOpen} onOpenChange={setIsIOSDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              Install on iOS
            </DialogTitle>
            <DialogDescription>
              Follow these steps to add Mees AI to your home screen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-6 py-4">
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Tap the Share button</p>
                <div className="flex items-center">
                  <Share2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Use the Share button in Safari's toolbar</p>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Scroll down and tap "Add to Home Screen"</p>
                <div className="flex items-center">
                  <PlusCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Look for the "Add to Home Screen" option</p>
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Tap "Add" in the top-right corner</p>
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mees AI will be added to your home screen</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <div className="w-full rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Once installed, Mees AI will work like a native app with full-screen experience and offline capabilities.
              </p>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}