'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UpgradeButtonProps {
  className?: string
}

export function UpgradeButton({ className }: UpgradeButtonProps) {
  const handleUpgrade = () => {
    // Add your upgrade/payment logic here
    window.location.href = '/pricing' // Or your payment page URL
  }

  return (
    <Button 
      onClick={handleUpgrade} 
      className={cn('bg-gradient-to-r from-purple-500 to-purple-700', className)}
    >
      Upgrade Now
    </Button>
  )
}