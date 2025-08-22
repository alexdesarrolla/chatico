"use client"

import { Message } from "@/store/chat-store"
import { Bot, User, Copy, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { FormattedMessage } from "./formatted-message"

interface ChatMessageProps {
  message: Message
  onRetry?: () => void
  onDelete?: () => void
}

export function ChatMessage({ message, onRetry, onDelete }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      // Intentar usar el Clipboard API moderno primero
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message.content)
      } else {
        // Fallback para navegadores que no soportan Clipboard API o no están en contexto seguro
        const textArea = document.createElement('textarea')
        textArea.value = message.content
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
        } catch (execError) {
          throw new Error('No se pudo copiar el texto')
        } finally {
          document.body.removeChild(textArea)
        }
      }
      
      setCopied(true)
      toast({
        title: "Copiado al portapapeles",
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el texto al portapapeles",
        variant: "destructive",
      })
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : ''
        }`}
        data-theme-component={message.role === 'user' ? '' : 'gradient'}>
          {message.role === 'user' ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>
      </div>

      <div className={`flex-1 max-w-3xl ${
        message.role === 'user' ? 'text-right' : 'text-left'
      }`}>
        <Card className={`inline-block ${
          message.role === 'user' 
            ? 'bg-primary/10 border-primary/20' 
            : 'bg-muted/30 border-muted/50'
        } backdrop-blur-sm`}
        data-theme-component="card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {message.role === 'user' ? 'Tú' : 'IA'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <FormattedMessage 
                content={message.content} 
                isStreaming={message.isStreaming} 
              />
            </div>

            <AnimatePresence>
              <div className={`flex gap-1 mt-2 ${
                message.role === 'user' ? 'justify-start' : 'justify-end'
              }`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className={`w-3 h-3 ${copied ? 'text-green-500' : ''}`} />
                  </Button>
                </motion.div>

                {message.role === 'assistant' && onRetry && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRetry}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}

                {onDelete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}