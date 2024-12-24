'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StarryBackground } from '@/components/starryBackground'
import { addToWaitlist } from "@/app/actions/waitlist"
import { useToast } from "@/hooks/use-toast"

export default function DownloadPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    months: 3,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const targetDate = new Date('2024-07-24T00:00:00')
    
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30))
        const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ months, days, hours, minutes, seconds })
      }
    }

    const timer = setInterval(updateCountdown, 1000)
    updateCountdown()

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const email = formData.get('email') as string
      await addToWaitlist(email)
      window.location.href = '/'
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
        className="text-5xl font-bold mb-2 text-purple-400"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        MEES AI
      </motion.h1>
      
      <motion.div 
        className="flex justify-center items-center space-x-6 mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center min-w-[100px] bg-purple-900/50 p-6 rounded-lg">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm uppercase text-purple-300">{unit}</span>
          </div>
        ))}
      </motion.div>

      <motion.div 
        className="w-full max-w-xl px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h2 className="text-2xl mb-4 text-center">Join the waiting list</h2>
        <form action={handleSubmit} className="flex space-x-2">
          <Input 
            name="email"
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow bg-gray-800 text-white border-purple-500"
            required
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Joining...' : 'Join'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

