'use client'

import { StripeCheckout } from '@/components/stripe-checkout'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SignInButton, useClerk, useUser } from '@clerk/nextjs'
import {
    Check as CheckIcon,
    CreditCard,
    Database,
    FileText,
    HelpCircle,
    Info,
    LogIn,
    LogOut,
    Mail,
    Monitor,
    Moon,
    Settings,
    Shield,
    Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { PWAInstallButton } from './pwa-install-button'

// Add pricing constants
const PRICING = {
  monthly: {
    price: 9.50,
    originalPrice: 20.00,
    interval: 'month'
  },
  lifetime: {
    price: 200.00,
    originalPrice: 400.99,
    interval: 'one-time'
  }
}

export function SettingsMenu({ t }: { t: any }) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'lifetime'>('monthly')

  const handleLogout = async () => {
    await signOut()
    setOpen(false)
    window.location.href = '/'
  }

  const themeOptions = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Monitor },
  ]

  const handleUpgradeClick = () => {
    setOpen(false)  // Close settings dialog
    setTimeout(() => {
      setShowPricing(true)  // Open pricing dialog after a brief delay
    }, 100)
  }

  // If user is not logged in, show sign in button with install button
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        
        <SignInButton mode="modal">
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800"
          >
            <LogIn size={20} className="text-gray-600 dark:text-gray-400" />
          </Button>
        </SignInButton>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
       
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800">
              <Settings size={20} className="text-gray-600 dark:text-gray-400" />
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[calc(80vh-100px)] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Account</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                    <Mail className="h-5 w-5" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {user?.primaryEmailAddress?.emailAddress || 'Not signed in'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-start gap-3" size="lg" onClick={handleUpgradeClick}>
                    <CreditCard className="h-5 w-5" />
                    Upgrade to Plus
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                    <Database className="h-5 w-5" />
                    Data Control
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">App</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <Button
                          key={option.value}
                          variant={theme === option.value ? "default" : "outline"}
                          className="justify-start gap-2"
                          onClick={() => setTheme(option.value)}
                        >
                          <Icon className="h-5 w-5" />
                          {option.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">About</h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                    <HelpCircle className="h-5 w-5" />
                    Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                    <FileText className="h-5 w-5" />
                    Terms of Use
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                    <Shield className="h-5 w-5" />
                    Privacy Policy
                  </Button>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                    <Info className="h-5 w-5" />
                    <p className="text-sm font-medium">Mees v1.0.0</p>
                  </div>
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full justify-start gap-3" 
                size="lg"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to Plus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-4 py-2 rounded-md ${
                    billingInterval === 'monthly' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted-foreground/10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('lifetime')}
                  className={`px-4 py-2 rounded-md ${
                    billingInterval === 'lifetime'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted-foreground/10'
                  }`}
                >
                  Lifetime
                </button>
              </div>

              <div className="w-full max-w-sm rounded-lg border p-6 space-y-4">
                <h3 className="text-2xl font-bold text-center">
                  {billingInterval === 'monthly' ? 'Pro Monthly' : 'Pro Lifetime'}
                </h3>
                
                <div className="text-center">
                  <div className="flex justify-center items-baseline space-x-2">
                    <span className="text-3xl font-bold">
                      ${PRICING[billingInterval].price}
                    </span>
                    {billingInterval === 'monthly' && (
                      <span className="text-muted-foreground">/ month</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground line-through">
                    ${PRICING[billingInterval].originalPrice}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>Access to all models</span>
                  </div>
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>o3-mini</span>
                  </div>
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>Claude 3 Opus</span>
                  </div>
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>Deepseek Coder 33B</span>
                  </div>
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>Deepseek Code V2</span>
                  </div>
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>Unlimited messages</span>
                  </div>
                  <div className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    <span>Priority support</span>
                  </div>
                </div>

                <StripeCheckout 
                  priceId={
                    billingInterval === 'monthly'
                      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || ''
                      : process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || ''
                  } 
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 