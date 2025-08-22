"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChatStore } from "@/store/chat-store"
import { PaperPlane } from "./paper-plane"
import { SendSuccess } from "./send-success"
import { FileAttachment, AttachedFile } from "./file-attachment"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ChatInputProps {
  onSend: (message: string, files?: AttachedFile[]) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isPlaneFlying, setIsPlaneFlying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [showAttachmentPanel, setShowAttachmentPanel] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isGenerating } = useChatStore()

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  const handleSend = () => {
    if ((message.trim() || attachedFiles.length > 0) && !disabled && !isGenerating) {
      // Iniciar animación del avión de papel
      setIsPlaneFlying(true)
      
      // Mostrar efecto de éxito después de un breve retraso
      setTimeout(() => {
        setShowSuccess(true)
      }, 800)
      
      onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined)
      setMessage("")
      setAttachedFiles([])
      setShowAttachmentPanel(false)
      
      // Resetear altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-theme-component="card"
    >
      {/* Panel de archivos adjuntos */}
      <AnimatePresence>
        {showAttachmentPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b bg-background"
          >
            <div className="container mx-auto px-4 py-4">
              <FileAttachment
                onFilesChange={setAttachedFiles}
                disabled={disabled || isGenerating}
                maxFiles={3}
                maxSize={5}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="min-h-[60px] max-h-[120px] resize-none rounded-2xl border-muted-foreground/20 focus:border-primary/50 pr-12"
              data-theme-component="input"
              disabled={disabled || isGenerating}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 relative"
                disabled={disabled || isGenerating}
                onClick={() => setShowAttachmentPanel(!showAttachmentPanel)}
              >
                <Paperclip className="w-4 h-4" />
                {attachedFiles.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {attachedFiles.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={disabled || isGenerating}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Button
                onClick={handleSend}
                disabled={(!message.trim() && attachedFiles.length === 0) || disabled || isGenerating}
                size="icon"
                className="h-12 w-12 rounded-full shrink-0"
                data-theme-component="button"
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </div>

      {/* Animación del avión de papel */}
      <PaperPlane 
        isFlying={isPlaneFlying}
        onComplete={() => setIsPlaneFlying(false)}
      />
      
      {/* Efecto de éxito */}
      <SendSuccess 
        show={showSuccess}
        onComplete={() => setShowSuccess(false)}
      />
    </motion.div>
  )
}