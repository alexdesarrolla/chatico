"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useChatStore } from "@/store/chat-store"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ChatHeader } from "@/components/chat-header"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Bot } from "lucide-react"
import { FileAttachment, AttachedFile } from "@/components/file-attachment"
import { LiveAnnouncer } from "@/components/live-announcer"

export default function Home() {
  const {
    currentSession,
    isGenerating,
    addMessage,
    createNewSession,
    setCurrentSession,
    sessions,
    setIsGenerating,
    startStreaming,
    appendToStreamingMessage,
    stopStreaming,
    settings,
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Inicializar sesión si no existe
  useEffect(() => {
    if (!currentSession) {
      const session = createNewSession()
      setCurrentSession(session)
    }
  }, [currentSession, createNewSession, setCurrentSession])

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages])

  const handleSendMessage = async (content: string, files?: AttachedFile[]) => {
    if (!currentSession) return

    // Agregar mensaje del usuario
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    // Crear mensaje de IA vacío para streaming
    const aiMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }
    addMessage(aiMessage)

    setIsGenerating(true)
    startStreaming(aiMessage.id)

    try {
      // Preparar mensajes para la API
      const apiMessages = [
        ...currentSession.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content },
      ]

      // Si hay archivos adjuntos, agregarlos al mensaje
      if (files && files.length > 0) {
        const fileContents = files.map(file => {
          if (file.type.startsWith('image/')) {
            return `[Imagen adjunta: ${file.name}]\n${file.content}`
          } else {
            return `[Documento adjunto: ${file.name}]\n${file.content}`
          }
        }).join('\n\n')
        
        // Agregar el contenido de los archivos al mensaje del usuario
        apiMessages[apiMessages.length - 1].content += `\n\n${fileContents}`
      }

      // Crear AbortController para cancelar la petición
      abortControllerRef.current = new AbortController()

      console.log('Sending request to /api/chat with:', {
        messages: apiMessages.length,
        stream: true,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        hasFiles: files && files.length > 0
      })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          stream: true,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        }),
        signal: abortControllerRef.current.signal,
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error response:', errorData)
        throw new Error(errorData.error || "Error en la respuesta del servidor")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ""
                  if (content) {
                    appendToStreamingMessage(aiMessage.id, content)
                  }
                } catch (e) {
                  console.error("Error parsing SSE data:", e, "Raw data:", data)
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error en el chat:", error)
        appendToStreamingMessage(aiMessage.id, "\n\n❌ Error al generar la respuesta. Por favor, intenta de nuevo.")
      }
    } finally {
      stopStreaming(aiMessage.id)
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleRetry = (messageId: string) => {
    if (!currentSession) return

    // Encontrar el mensaje a reintentar
    const messageIndex = currentSession.messages.findIndex(msg => msg.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    // Obtener el mensaje anterior (del usuario)
    const userMessage = currentSession.messages[messageIndex - 1]
    if (userMessage.role !== "user") return

    // Eliminar mensajes desde el mensaje del usuario en adelante
    const messagesToKeep = currentSession.messages.slice(0, messageIndex - 1)
    
    // Actualizar la sesión
    const updatedSession = {
      ...currentSession,
      messages: messagesToKeep,
      updatedAt: new Date(),
    }

    setCurrentSession(updatedSession)

    // Reenviar el mensaje
    handleSendMessage(userMessage.content)
  }

  const handleDelete = (messageId: string) => {
    if (!currentSession) return

    // Eliminar el mensaje
    const updatedMessages = currentSession.messages.filter(msg => msg.id !== messageId)
    
    // Actualizar la sesión
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      updatedAt: new Date(),
    }

    setCurrentSession(updatedSession)
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Cargando chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader />

      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full flex">
          {/* Área de chat */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {currentSession.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-md mx-auto"
                  >
                    <Card className="p-8">
                      <CardContent className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <Bot className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold mb-2">¡Hola! Soy tu asistente de IA</h2>
                          <p className="text-muted-foreground">
                            Estoy aquí para ayudarte con cualquier pregunta o tarea. 
                            ¿En qué puedo asistirte hoy?
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            "¿Qué puedes hacer?",
                            "Explírame la inteligencia artificial",
                            "Ayúdame a programar",
                            "Cuéntame un chiste"
                          ].map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendMessage(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <AnimatePresence>
                    {currentSession.messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onRetry={() => handleRetry(message.id)}
                        onDelete={() => handleDelete(message.id)}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <ChatInput
              onSend={handleSendMessage}
              disabled={isGenerating}
            />
          </div>

          {/* Panel lateral de historial */}
          <div className="hidden lg:block w-80 p-4">
            <ChatSidebar />
          </div>
        </div>
      </main>

      {/* Anunciador para accesibilidad */}
      <LiveAnnouncer />
    </div>
  )
}