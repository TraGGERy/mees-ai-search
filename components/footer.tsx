import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiFacebook, SiGithub, SiTwitter, SiWhatsapp } from 'react-icons/si'
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
          <Link href="/privacy-policy" target="_blank">
            ?
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://twitter.com/Iamtoxix" target="_blank">
            <SiTwitter size={18} />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://facebook.com/profile.php?id=100090089754837&mibextid=LQQJ4d" target="_blank">
            <SiFacebook size={18} />
          </Link>
        </Button>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://wa.me/263789539103" target="_blank">
            <SiWhatsapp size={18} />
          </Link>
        </Button>
      </div>
    </footer>
  )
}

export default Footer
