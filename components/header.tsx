"use client"
import React from 'react'
import { ModeToggle } from './mode-toggle'
import { IconLogo } from './ui/icons'
import { cn } from '@/lib/utils'
import HistoryContainer from './history-container'
import reactElementToJSXString from "react-element-to-jsx-string";
import { toast, Toaster } from "sonner";
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { IconAlarmPlus, IconBell, IconHome, IconNews, IconNotification, IconPackage, IconSubscript, IconUser, IconWallet } from '@tabler/icons-react'
import { NotificationUpdate } from './xui/notifiatication-update'
import { icons } from 'lucide-react'

function Header  () {
  const {user,isSignedIn}=useUser();

  return (
    <header className="fixed w-full p-1 md:p-2 flex justify-between items-center z-10 backdrop-blur md:backdrop-blur-none bg-background/80 md:bg-transparent">
      <div>
        <a href="/">
          <IconHome className={cn('w-5 h-5')} />
          <span className="sr-only">Mees Ai Research</span>
        </a>
      </div>
      <div className="flex gap-0.5">

        
      <div>
      <NotificationUpdate></NotificationUpdate></div>
     
    <a href='/news' >
      <button className="bg-slate-800 m-2 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-5  text-white inline-block">
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
        </span>
        <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
          <IconNews className='w-4 h-4'></IconNews><span>{`Articles`}</span>
          
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
      </button>
      </a> 

      {isSignedIn?
          <a href='/prices'>
           
           <button className="bg-slate-800 m-2 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-5  text-white inline-block">
              <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
          <IconWallet className='w-4 h-4'></IconWallet> <span>{`Sub`}</span> 
          
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          </button>
           </a>
        :null
      }

    {isSignedIn?
        <UserButton/>
    
    :<a href='/sign-in' >
      <button className="bg-slate-800 m-2 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-5  text-white inline-block">
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
        </span>
        <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
          <IconUser className='w-4 h-4'></IconUser> <span>{`Login`}</span> 
          
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
      </button>
      </a>
      }
         
        <ModeToggle />
       
      </div>
    </header>
  )
}

export default Header
