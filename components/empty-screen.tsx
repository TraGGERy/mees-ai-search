import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUpIcon } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'What is StarLink kit?',
    message: 'What is StarLink kit?'
  },
  {
    heading: 'Why is Nvidia growing rapidly?',
    message: 'Why is Nvidia growing rapidly?'
  },
  {
    heading: 'Do a research on why Nation Fail ?',
    message: 'Do a research on why Nation Fail?'
  },
  {
    heading: 'Econet zimbabwe vs Netone zimbabwe',
    message: 'Econet zimbabwe vs Netone zimbabwe'
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
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <TrendingUpIcon size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
