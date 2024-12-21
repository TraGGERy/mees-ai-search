import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { IconMessage } from "@tabler/icons-react"
import { ArrowRight, Quote, Atom, PenSquare, Rocket } from 'lucide-react'
import Link from "next/link"

const exampleMessages = [
  {
    heading: 'What is OpenAI o3?',
    message: 'What is OpenAI o3?'
  },
  {
    heading: 'Why is Nvidia growing rapidly?',
    message: 'Why is Nvidia growing rapidly?'
  },
  {
    heading: 'Econet vs Starlink',
    message: 'Econet vs Starlink'
  },
  {
    heading: 'Summary: https://arxiv.org/abs/2410.02677',
    message: 'Summary: https://arxiv.org/abs/2410.02677'
  }
]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className="top-8 p-3">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Action Cards Grid */}
        <div className="mx-auto w-full">
          <div className="bg-background p-1">
            <div className="grid grid-cols-2 gap-2">
              {exampleMessages.map((message, index) => (
                <Card key={index} className="group relative overflow-hidden bg-zinc-900 border border-purple-500 transition-colors hover:border-purple-400">
                  <Button
                    variant="link"
                    className="h-auto p-2 text-xs sm:text-sm w-full justify-start"
                    name={message.message}
                    onClick={() => submitMessage(message.message)}
                  >
                    <div className="flex items-start space-x-2">
                      <IconMessage className="h-4 w-4 text-purple-500 mt-1" />
                      <div className="flex flex-col items-start">
                        <ArrowRight size={12} className="mb-1 text-purple-400" />
                        <span className="font-semibold text-white">{message.heading}</span>
                      </div>
                    </div>
                  </Button>
                </Card>
              ))}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}
