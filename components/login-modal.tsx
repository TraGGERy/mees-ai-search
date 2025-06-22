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
            To use advanced tools like Academic, Deep Search, Essay Plan, and others, please sign in or create an account.
            The Web tool remains available without login.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 bg-white text-black hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
          >
            Continue with Basic Model
          </Button>
          <Button 
            onClick={handleSignIn}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-full shadow-sm transition-all duration-200 hover:shadow-md border-0 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.146 0c-1.22.003-2.804.437-3.93 1.43-1.07.95-1.764 2.43-1.667 3.812.1.06.01.12.023.18 1.145-.3 2.345-.92 3.25-1.894.97-1.05 1.63-2.52 1.477-3.982-.05-.18-.1-.36-.153-.546zm-1.202 5.563c-.55.033-1.3.4-2.17.88-.13.073-1.79 1.12-1.79 3.337 0 2.595 2.164 3.536 2.23 3.56-.02.06-.37 1.277-1.22 2.527-.73 1.073-1.487 2.14-2.677 2.14-.58 0-.98-.16-1.392-.33-.43-.18-.876-.36-1.58-.36-.74 0-1.213.19-1.657.37-.4.16-.78.32-1.32.34-.83.03-1.47-.92-2.01-1.77-1.09-1.73-1.93-4.4-1.93-6.923 0-4.06 2.49-6.21 4.95-6.21.68 0 1.26.2 1.75.37.42.15.8.28 1.12.28.27 0 .64-.12 1.07-.27.68-.23 1.51-.52 2.34-.44 1.06.03 2.01.6 2.63 1.5-1.17.75-1.96 1.91-1.96 3.23 0 1.45.93 2.76 2.35 3.38-.28.86-.7 1.76-1.23 2.48.03-.01 1.14-.48 2.11-2.5.18-.38.32-.77.42-1.15.7-.28 1.31-.71 1.78-1.27-1.3-1.27-1.47-2.94-1.47-3.47 0-2.21 1.98-3.25 2.07-3.3.03-.02.06-.04.09-.06-.8-1.24-2.04-1.97-3.47-1.97z" fill="currentColor"/>
            </svg>
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}