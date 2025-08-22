"use client"

import { useEffect, useRef } from "react"
import { useChatStore } from "@/store/chat-store"

export function LiveAnnouncer() {
  const { currentSession } = useChatStore()
  const announcementRef = useRef<HTMLDivElement>(null)
  const lastMessageCount = useRef(0)

  useEffect(() => {
    if (!currentSession) return

    const currentMessageCount = currentSession.messages.length
    
    // Solo anunciar si hay nuevos mensajes
    if (currentMessageCount > lastMessageCount.current) {
      const lastMessage = currentSession.messages[currentMessageCount - 1]
      
      if (lastMessage && announcementRef.current) {
        const role = lastMessage.role === 'user' ? 'Tú' : 'Asistente'
        const announcement = `Nuevo mensaje de ${role}: ${lastMessage.content.substring(0, 100)}${lastMessage.content.length > 100 ? '...' : ''}`
        
        announcementRef.current.textContent = announcement
        
        // Limpiar después de un tiempo
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = ''
          }
        }, 1000)
      }
      
      lastMessageCount.current = currentMessageCount
    }
  }, [currentSession?.messages, currentSession])

  return (
    <div
      ref={announcementRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )
}