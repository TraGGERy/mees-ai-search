'use client'

import React, { useEffect, useState } from 'react'

export function SplashScreen() {
  // State for animated entrance effects
  const [visible, setVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const [dotsVisible, setDotsVisible] = useState(false)

  useEffect(() => {
    // Staggered animation sequence
    const timer1 = setTimeout(() => setVisible(true), 100)
    const timer2 = setTimeout(() => setTextVisible(true), 600)
    const timer3 = setTimeout(() => setDotsVisible(true), 1000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-blue-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 overflow-hidden">
      {/* Apple-inspired logo container with pulsing effect */}
      <div 
        className={`relative mb-8 transform transition-all duration-1000 ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        {/* App icon with enhanced 3D effect */}
        <div className="relative w-32 h-32 rounded-[28%] bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-indigo-500 dark:to-indigo-700 shadow-2xl flex items-center justify-center overflow-hidden transform transition-all duration-700 hover:rotate-3 hover:scale-105">
          {/* Inner shadow for depth */}
          <div className="absolute inset-1 rounded-[25%] bg-gradient-to-br from-white/10 to-transparent"></div>
          
          {/* Inner icon content - stylized "M" for Mees */}
          <div className="text-white text-6xl font-bold tracking-tighter transform -translate-y-1 relative z-10 drop-shadow-lg">
            M
            <div className="absolute inset-0 blur-sm opacity-40 -z-10"></div>
          </div>
          
          {/* Glass reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-white/5 rounded-t-[28%]"></div>
          
          {/* Bottom shadow for 3D effect */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black/20 rounded-b-[28%]"></div>
        </div>
        
        {/* Animated rings */}
        <div className="absolute -inset-4 border-2 border-blue-300/30 dark:border-blue-500/30 rounded-full animate-ping-slow"></div>
        <div className="absolute -inset-8 border-2 border-indigo-300/20 dark:border-indigo-500/20 rounded-full animate-ping-slower"></div>
      </div>
      
      {/* App name with gradient - animated entrance */}
      <div 
        className={`mb-8 text-center transform transition-all duration-700 ${textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 animate-gradient">Mees AI</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 font-medium">Your intelligent companion</p>
      </div>
      
      {/* Apple-style loading indicator - animated entrance */}
      <div 
        className={`flex space-x-2 transition-all duration-700 ${dotsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400"
            style={{
              animation: `bounce 1.4s infinite ease-in-out both`,
              animationDelay: `${i * 0.16}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}