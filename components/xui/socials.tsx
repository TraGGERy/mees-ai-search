'use client'

import * as React from 'react'
import { ArrowBigUp, Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconBadge, IconBrightness, IconCalendarBolt, IconCodeDots, IconCopy, IconCopyX, IconDesk, IconDeviceLaptop, IconDots, IconLamp, IconLighter, IconMarkdown, IconMarkdownOff, IconMoon, IconPlayerTrackNext, IconSearch, IconSelect, IconSocial, IconSun, IconVersions } from '@tabler/icons-react'
import { SiAboutdotme, SiAcademia, SiDiscord, SiFacebook, SiGithub, SiHelpdesk, SiInfosys, SiMattermost, SiPrivateinternetaccess, SiTwitter, SiWhatsapp, SiX } from 'react-icons/si'
import Link from 'next/link'

export function Socials() {
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.0rem] w-[1.2rem] rotate-0 scale-90 transition-all dark:-rotate-90 dark:scale-0" />
          <IconSocial className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem >
        <a href='/home'> 
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50 items-stretch"
        >
          
            <IconBadge size={16} />
        </Button>
         <span>Mees Ai Pro</span> </a> 
        </DropdownMenuItem>
        <DropdownMenuItem >
        <a href='/help_&_faq'> 
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50 items-stretch"
        >
            <SiHelpdesk size={16} />
        
        </Button> Help And FAQ</a>

        </DropdownMenuItem>

        <DropdownMenuItem >
        <a href='/terms-of-service'>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50 items-stretch"
        >
          
            <SiMattermost size={16} />
          
        
        </Button> Terms of service</a>
        
        </DropdownMenuItem>
        <DropdownMenuItem >
        <a href='/privacy-policy'>
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50 items-stretch"
        >
        
        <SiPrivateinternetaccess size={16}/>
        </Button>Privacy Policy</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
