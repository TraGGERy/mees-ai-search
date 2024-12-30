'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SiAboutdotme, SiAcademia, SiDiscord, SiFacebook, SiGithub, SiInfosys, SiPrivateinternetaccess, SiTwitter, SiWhatsapp, SiX } from 'react-icons/si'
import { Button } from './ui/button'
import { Socials } from './xui/socials'

const Footer: React.FC = () => {
  const pathname = usePathname()
  
  if (pathname === '/chat') return null
  
  return (
    <footer className="w-fit p-0 md:p-2 fixed bottom-0 right-0">
      <div className="flex justify-end">
        <Socials></Socials>
      </div>
    </footer>
  )
}

export default Footer
