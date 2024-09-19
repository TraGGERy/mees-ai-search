import React from 'react'
import Link from 'next/link'
import { SiAboutdotme, SiAcademia, SiDiscord, SiFacebook, SiGithub, SiInfosys, SiPrivateinternetaccess, SiTwitter, SiWhatsapp, SiX } from 'react-icons/si'
import { Button } from './ui/button'
import { Socials } from './xui/socials'

const Footer: React.FC = () => {
  return (
    <footer className="w-fit p-0 md:p-2 fixed bottom-0 right-0">
      <div className="flex justify-end">
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="/privacy-policy" target="_blank">
            <SiPrivateinternetaccess size={18}/>
          </Link>
        </Button>
        <Socials></Socials>
      </div>
    </footer>
  )
}

export default Footer
