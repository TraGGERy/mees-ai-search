'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { useClerk } from '@clerk/nextjs'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { openSignIn } = useClerk()

  const handleSignIn = () => {
    openSignIn()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription className="pt-4">
            To use advanced models, please sign in or create an account.
            The basic model (Auto Search) remains available without login.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Continue with Basic Model
          </Button>
          <Button 
            onClick={handleSignIn}
            className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 