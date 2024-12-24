'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StarryBackground } from '@/components/starryBackground'
import { addToWaitlist } from "@/app/actions/waitlist";

export default function MobileDownloadPage() {
  const [timeLeft, setTimeLeft] = useState({
    months: 3,
    days: 24,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const targetDate = new Date('2024-04-24T00:00:00') // Set your target date here
    
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30))
      const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ months, days, hours, minutes, seconds })
    }

    const timer = setInterval(updateCountdown, 1000)
    updateCountdown() // Initial call

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 space-y-8 overflow-hidden">
      <StarryBackground />
      <motion.h1 
        className="text-4xl font-bold mb-2 text-purple-400"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        MEES AI
      </motion.h1>
      <motion.p 
        className="text-lg mb-4 text-blue-300"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        AI-powered search engine
      </motion.p>

      <motion.div 
        className="flex justify-center items-center space-x-2 mb-8 overflow-x-auto w-full max-w-md px-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center min-w-[60px]">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs uppercase">{unit}</span>
          </div>
        ))}
      </motion.div>

      <motion.div 
        className="relative w-48 h-96 sm:w-64 sm:h-128 mb-8"
        initial={{ opacity: 0, rotateY: 90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <svg className="absolute inset-0" viewBox="0 0 320 640" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="300" height="620" rx="40" stroke="white" strokeWidth="20"/>
        </svg>
        <div className="absolute inset-4 sm:inset-8 bg-purple-900 rounded-3xl flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-white">MEES AI</span>
        </div>
      </motion.div>

      <motion.div 
        className="w-full max-w-md px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-xl mb-4 text-center">Join the waiting list</h2>
        <p className="text-center mb-4 text-sm text-gray-400">
          Launching on {formatDate(new Date('2024-04-24'))}
        </p>
        <form action={async (formData: FormData) => {
          await addToWaitlist(formData.get('email') as string);
        }} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input 
            name="email"
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow bg-gray-800 text-white border-purple-500"
            required
          />
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
            Join
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

