// Based on: https://github.com/vercel/ai/blob/main/examples/next-ai-rsc/components/llm-stocks/spinner.tsx

import { Card } from './card'
import { IconLogo } from './icons'
import { Loader2 } from 'lucide-react'

export const Spinner = () => (
  <div className="flex items-start justify-start space-x-2 text-purple-700">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">Mees AI is thinking...</span>
    </div>
)

export const LogoSpinner = () => (
  <div className="p-4 border border-background">
    <IconLogo className="w-4 h-4 animate-spin" />
  </div>
)
