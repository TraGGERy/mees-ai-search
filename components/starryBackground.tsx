'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Star = ({ x, y }: { x: number; y: number }) => (
  <motion.div
    className="absolute rounded-full bg-white"
    style={{ x, y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: Math.random() * 3 + 2,
      repeat: Infinity,
      repeatType: 'loop',
    }}
  />
)

export function StarryBackground() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <Star key={star.id} x={star.x} y={star.y} />
      ))}
    </div>
  )
}

