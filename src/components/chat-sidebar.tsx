"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Trash2, 
  Clock,
  Pin
} from "lucide-react"
import { useChatStore } from "@/store/chat-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ChatSidebarProps {
  className?: string
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const {
    sessions,
    currentSession,
    setCurrentSession,
    createNewSession,
    deleteSession,
  } = useChatStore()

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatSessionDate = (date: Date) => {
    const now = new Date()
    const sessionDate = new Date(date)
    
    if (sessionDate.toDateString() === now.toDateString()) {
      return format(sessionDate, 'HH:mm', { locale: es })
    } else if (sessionDate.getFullYear() === now.getFullYear()) {
      return format(sessionDate, 'd MMM', { locale: es })
    } else {
      return format(sessionDate, 'd MMM yyyy', { locale: es })
    }
  }

  const getSessionPreview = (messages: any[]) => {
    if (messages.length === 0) return "Nueva conversación"
    
    const lastMessage = messages[messages.length - 1]
    const preview = lastMessage.content.substring(0, 50)
    return preview.length < lastMessage.content.length ? preview + "..." : preview
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardContent className="p-4 flex-1 flex flex-col space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Historial
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={createNewSession}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No se encontraron conversaciones" : "No hay conversaciones anteriores"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-3"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative group">
                  <Button
                    variant={session.id === currentSession?.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3 hover:bg-accent"
                    onClick={() => setCurrentSession(session)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium truncate">
                          {session.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {session.messages.length}
                          </Badge>
                          {session.id === currentSession?.id && (
                            <Pin className="w-3 h-3 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-1">
                        {getSessionPreview(session.messages)}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatSessionDate(session.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </Button>

                  {/* Delete button */}
                  {session.id !== currentSession?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar esta conversación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la conversación "{session.title}" y todos sus mensajes. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSession(session.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            {sessions.length} conversación{sessions.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}