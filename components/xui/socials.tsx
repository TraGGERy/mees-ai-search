'use client'

import * as React from 'react'
import { Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconBrightness, IconCalendarBolt, IconCodeDots, IconCopy, IconCopyX, IconDesk, IconDeviceLaptop, IconDots, IconLamp, IconLighter, IconMarkdown, IconMarkdownOff, IconMoon, IconPlayerTrackNext, IconSearch, IconSelect, IconSun, IconVersions } from '@tabler/icons-react'

export function Socials() {
 
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.0rem] w-[1.2rem] rotate-0 scale-90 transition-all dark:-rotate-90 dark:scale-0" />
          <Bell className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem >
        <IconSelect className='mr-1 h-5 w-6 mt-0 py-0 text-green-400'/>
          Mees v0.3.9
        </DropdownMenuItem>
        <DropdownMenuItem >
        <IconSelect className='mr-1 h-5 w-6 mt-0 py-0 text-white-700'/>
        New Copy button
        </DropdownMenuItem>
        <DropdownMenuItem >
        <IconSelect className='mr-1 h-5 w-6 mt-0 py-0 text-white-700'/>
        Shareable Results
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
