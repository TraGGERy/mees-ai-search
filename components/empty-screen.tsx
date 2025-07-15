import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const exampleMessages = [
  {
    heading: 'Summarize recent advances in large language models',
    message: 'Summarize recent advances in large language models for academic research'
  },
  {
    heading: 'Compare methodologies: qualitative vs quantitative research',
    message: 'Compare methodologies: qualitative vs quantitative research in social sciences'
  },
  {
    heading: 'Find papers on climate change adaptation strategies',
    message: 'Find recent papers on climate change adaptation strategies in agriculture'
  },
  {
    heading: 'Analyze this paper: https://arxiv.org/pdf/2501.05707',
    message: 'Analyze and summarize the key findings from https://arxiv.org/pdf/2501.05707'
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
        <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
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
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
