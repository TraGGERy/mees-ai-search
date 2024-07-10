'use client'

import { Section } from './section'
import { BotMessage } from './message'

export type AnswerSectionProps = {
  result: string
}

export function AnswerSectionGenerated({ result }: AnswerSectionProps) {
  return (
    <div>
      <Section title="Answer">
        <BotMessage content={result} />
      </Section>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 5b6960e403814a9a3c79e40e21d8c6246dc3618c
