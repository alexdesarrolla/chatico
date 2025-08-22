"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ThemeSelector from "@/components/theme-selector"
import { 
  Settings, 
  MessageSquare, 
  Trash2, 
  Plus,
  Bot,
  History,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useChatStore } from "@/store/chat-store"
import { motion } from "framer-motion"

export function ChatHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { 
    settings, 
    updateSettings, 
    currentSession, 
    createNewSession, 
    clearMessages,
    sessions 
  } = useChatStore()

  const handleNewChat = () => {
    createNewSession()
  }

  const handleClearChat = () => {
    if (currentSession) {
      clearMessages()
    }
  }

  const handleDeleteSession = () => {
    if (currentSession) {
      deleteSession(currentSession.id)
      createNewSession()
    }
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-theme-component="card"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" data-theme-component="gradient">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Chatico</h1>
              <p className="text-xs text-muted-foreground">GLM-4.5-Flash</p>
            </div>
          </motion.div>

          <div className="hidden sm:flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo chat</span>
            </Button>

            {currentSession && currentSession.messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      <span>Eliminar chat</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta conversación?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente la conversación actual y todos sus mensajes. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSession}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Configuración</DialogTitle>
                <DialogDescription>
                  Ajusta los parámetros del modelo de IA
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="temperature">
                    Temperatura: {settings.temperature}
                  </Label>
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[settings.temperature]}
                    onValueChange={([value]) => 
                      updateSettings({ temperature: value })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controla la aleatoriedad de las respuestas. Valores más altos son más creativos.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxTokens">
                    Tokens máximos: {settings.maxTokens}
                  </Label>
                  <Slider
                    id="maxTokens"
                    min={256}
                    max={4096}
                    step={256}
                    value={[settings.maxTokens]}
                    onValueChange={([value]) => 
                      updateSettings({ maxTokens: value })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Longitud máxima de la respuesta.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="thinking-mode"
                    checked={settings.thinkingMode}
                    onCheckedChange={(checked) => 
                      updateSettings({ thinkingMode: checked })
                    }
                  />
                  <Label htmlFor="thinking-mode">Modo de pensamiento</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Permite que el modelo muestre su razonamiento antes de dar la respuesta final.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <ThemeSelector />
        </div>
      </div>
    </motion.header>
  )
}