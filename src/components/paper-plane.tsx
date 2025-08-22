"use client"

import { motion } from "framer-motion"
import { Plane } from "lucide-react"

interface PaperPlaneProps {
  isFlying: boolean
  onComplete?: () => void
}

export function PaperPlane({ isFlying, onComplete }: PaperPlaneProps) {
  if (!isFlying) return null

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8,
        y: 0,
        x: 0,
        rotate: -45
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.8],
        y: [-20, -100, -150],
        x: [0, 50, 100],
        rotate: [-45, -30, -15]
      }}
      transition={{ 
        duration: 1.5,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1]
      }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-50"
      style={{
        bottom: "100px",
        right: "50px",
      }}
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: 4,
          repeatType: "reverse"
        }}
      >
        <Plane className="w-6 h-6 text-primary" strokeWidth={2} />
      </motion.div>
      
      {/* Estela del avión */}
      <motion.div
        initial={{ opacity: 0.4, scaleX: 0 }}
        animate={{ 
          opacity: [0.4, 0.2, 0],
          scaleX: [0, 1, 1.5]
        }}
        transition={{ 
          duration: 1.5,
          ease: "easeOut"
        }}
        className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent rounded-full"
        style={{
          transformOrigin: "right center",
          width: "100px",
          height: "2px",
          top: "50%",
          right: "12px",
          marginTop: "-1px"
        }}
      />
    </motion.div>
  )
}