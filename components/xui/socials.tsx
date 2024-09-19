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
import { IconBrightness, IconCalendarBolt, IconCodeDots, IconCopy, IconCopyX, IconDesk, IconDeviceLaptop, IconDots, IconLamp, IconLighter, IconMarkdown, IconMarkdownOff, IconMoon, IconPlayerTrackNext, IconSearch, IconSelect, IconSocial, IconSun, IconVersions } from '@tabler/icons-react'
import { SiAboutdotme, SiAcademia, SiDiscord, SiFacebook, SiGithub, SiInfosys, SiPrivateinternetaccess, SiTwitter, SiWhatsapp, SiX } from 'react-icons/si'
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
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://twitter.com/Mees_nz" target="_blank">
            <SiX size={18} />
          </Link>
        </Button>
         X
        </DropdownMenuItem>
        <DropdownMenuItem >
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://facebook.com/profile.php?id=100090089754837&mibextid=LQQJ4d" target="_blank">
            <SiFacebook size={18} />
          </Link>
        </Button> Facebook

        </DropdownMenuItem>
        <DropdownMenuItem >
        <Button
          variant={'ghost'}
          size={'icon'}
          className="text-muted-foreground/50"
        >
          <Link href="https://whatsapp.com/channel/0029VafFHO8IyPtbwtGq7K1G" target="_blank">
            <SiWhatsapp size={18} />
          </Link>
        </Button> WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
