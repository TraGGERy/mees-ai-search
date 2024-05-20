import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiGithub, SiTwitter, SiWhatsapp } from 'react-icons/si'
import { Button } from './ui/button'

const Footer: React.FC = () => {
  return (
    <footer className="w-fit p-1 md:p-2 fixed bottom-0 right-0">
      <div className="flex justify-end">
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://discord.gg/00000" target="_blank">
            <SiDiscord size={18} />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://twitter.com/Emperor_pegusus" target="_blank">
            <SiTwitter size={18} />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="" target="_blank">
            <SiGithub size={18} />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://www.whatsapp.com/channel/0029VafFHO8IyPtbwtGq7K1G" target="_blank">
            <SiWhatsapp size={18} />
          </Link>
        </Button>
      </div>
    </footer>
  )
}

export default Footer
