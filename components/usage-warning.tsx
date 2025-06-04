'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PricingModal } from './pricing-modal'

interface UsageWarningProps {
  onClose?: () => void
  onUpgrade?: () => void
  remaining?: number
}

export function UsageWarning({ remaining, onClose = () => {}, onUpgrade = () => {} }: UsageWarningProps) {
  const [showPricing, setShowPricing] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Only show once per session
    const dismissed = sessionStorage.getItem('usageWarningDismissed')
    if (dismissed === 'true') {
      setVisible(false)
    }
  }, [])

  // Only show warning when remaining is low
  if ((remaining ?? Infinity) > 3 || remaining === Infinity) {
    return null
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Usage Limit Warning</h3>
          <button 
            onClick={() => {
              setVisible(false)
              sessionStorage.setItem('usageWarningDismissed', 'true')
              if (onClose) onClose()
            }}
            className="p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4">
          {remaining === 0
            ? "You've reached your daily limit for advanced models."
            : `You only have ${remaining} advanced searches remaining today.`}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => {
            setVisible(false)
            sessionStorage.setItem('usageWarningDismissed', 'true')
            if (onClose) onClose()
          }}>
            Close
          </Button>
          <Button onClick={() => {
            setShowPricing(true)
            if (onUpgrade) onUpgrade()
          }}>
            Upgrade
          </Button>
        </div>
      </div>

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)}
        onSelectFree={() => {}}
        remaining={remaining}
      />
    </div>
  )
} 