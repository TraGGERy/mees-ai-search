'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { HoverBorderGradient } from "./ui/hover-border-gradient";

const exampleMessages = [
  {
    heading: 'What is Apple Intelligence?',
    message: 'What is Apple Intelligence?'
  },
  {
    heading: 'Why is Water So Tasteless?',
    message: 'Why is Water So Tasteless?'
  },
  
  
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
                <div className="m-0 flex justify-center text-center">
                     <HoverBorderGradient containerClassName="rounded-full" as="button"
                     className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2" >
              <ArrowRight size={16} className="mr-2 text-muted-foreground rounded-s-lg" />
              {message.heading}
                 </HoverBorderGradient>
    </div>

            </Button>
          ))}
        </div>
       
      </div>
    </div>
  )
}
