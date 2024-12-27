import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clapperboard, Carrot, TreesIcon as Lungs, Smartphone } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'The next James Bond',
    message: 'The next James Bond',
    icon: Clapperboard
  },
  {
    heading: 'Vegetables currently in season',
    message: 'Vegetables currently in season',
    icon: Carrot
  },
  {
    heading: 'Breathwork benefits and techniques',
    message: 'Breathwork benefits and techniques',
    icon: Lungs
  },
  {
    heading: 'Rumours about the new iPhone',
    message: 'Rumours about the new iPhone',
    icon: Smartphone
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
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto w-full">
          <div className="p-1">
            <div className="grid grid-cols-2 gap-2">
              {exampleMessages.map((message, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden border-0 hover:bg-zinc-800/50"
                >
                  <Button
                    variant="ghost"
                    className="h-auto p-2 text-sm w-full justify-start hover:bg-transparent"
                    onClick={() => submitMessage(message.message)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1 p-1.5 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-800">
                        <message.icon className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center space-x-2">
                          <div className="h-px w-3 bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0" />
                          <div className="h-px w-3 bg-gradient-to-r from-purple-400/50 to-purple-400/0" />
                        </div>
                        <span className="font-medium mt-0.5">{message.heading}</span>
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

