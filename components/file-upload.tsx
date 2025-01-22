import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Lock } from 'lucide-react'
import { useAuth, SignInButton } from '@clerk/nextjs'

export function FileUpload() {
  const { isSignedIn } = useAuth()
  const [file, setFile] = useState<File | null>(null)

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 border border-zinc-800 rounded-lg bg-zinc-950">
        <Lock className="h-8 w-8 text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-100">Authentication Required</h2>
        <p className="text-sm text-zinc-400">Please login to access file upload</p>
        <SignInButton>
          <Button variant="outline">
            Login to Continue
          </Button>
        </SignInButton>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 border border-zinc-800 rounded-lg bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-100">Coming Soon</h2>
      <p className="text-sm text-zinc-400">This feature is under development</p>
    </div>
  )
}

