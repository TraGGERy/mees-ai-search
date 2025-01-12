'use client';

import { motion } from 'framer-motion';

export default function OfflinePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-8"
    >
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 10
        }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-6xl mb-4"
        >
          📡
        </motion.div>

        <h1 className="text-3xl font-bold">
          Oops! You&apos;re Offline 🔌
        </h1>
        
        <p className="text-gray-600 max-w-md text-lg">
          Don&apos;t worry! Your data is safe. Check your internet connection and we&apos;ll get you back online ✨
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/'} 
          className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again 🔄
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 