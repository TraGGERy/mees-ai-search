'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconBadge, IconHelpCircle, IconFileDescription, IconLock } from '@tabler/icons-react'
import { SiDiscord } from 'react-icons/si'

export function Socials() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full bg-background/80 backdrop-blur-sm">
            <SiDiscord className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Social menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={5} 
          alignOffset={-5} 
          className="w-56"
          side="top"
        >
          <DropdownMenuItem asChild>
            <Link href="/home" className="flex items-center">
              <IconBadge className="mr-2 h-4 w-4" />
              <span>Mees AI Pro</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/help_&_faq" className="flex items-center">
              <IconHelpCircle className="mr-2 h-4 w-4" />
              <span>Help and FAQ</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/terms-of-service" className="flex items-center">
              <IconFileDescription className="mr-2 h-4 w-4" />
              <span>Terms of Service</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/privacy-policy" className="flex items-center">
              <IconLock className="mr-2 h-4 w-4" />
              <span>Privacy Policy</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

