"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface SendSuccessProps {
  show: boolean
  onComplete?: () => void
}

export function SendSuccess({ show, onComplete }: SendSuccessProps) {
  if (!show) return null

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8,
        rotate: -180
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1.2, 1, 0.8],
        rotate: [-180, 0, 10, 0]
      }}
      transition={{ 
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.3, 0.7, 1]
      }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-50"
      style={{
        bottom: "120px",
        right: "60px",
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: 1,
          repeatType: "reverse"
        }}
        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <Check className="w-5 h-5" strokeWidth={3} />
        
        {/* Círculo de onda expansiva */}
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ 
            scale: [0, 1.5, 2.5],
            opacity: [0.6, 0.3, 0]
          }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut"
          }}
          className="absolute inset-0 border-2 border-green-500 rounded-full"
        />
        
        <motion.div
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ 
            scale: [0, 1.2, 2],
            opacity: [0.4, 0.2, 0]
          }}
          transition={{ 
            duration: 1.2,
            delay: 0.2,
            ease: "easeOut"
          }}
          className="absolute inset-0 border-2 border-green-500 rounded-full"
        />
      </motion.div>
    </motion.div>
  )
}