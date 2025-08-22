"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Paperclip, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText,
  Upload,
  AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  content?: string
}

interface FileAttachmentProps {
  onFilesChange: (files: AttachedFile[]) => void
  disabled?: boolean
  maxFiles?: number
  maxSize?: number // in MB
}

export function FileAttachment({ 
  onFilesChange, 
  disabled = false, 
  maxFiles = 5,
  maxSize = 10 
}: FileAttachmentProps) {
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />
    } else if (type.includes('text') || type.includes('document')) {
      return <FileText className="w-4 h-4" />
    } else {
      return <File className="w-4 h-4" />
    }
  }

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processFiles = async (fileList: FileList) => {
    const newFiles: AttachedFile[] = []
    const remainingSlots = maxFiles - files.length

    if (fileList.length > remainingSlots) {
      toast({
        title: "Límite de archivos excedido",
        description: `Solo puedes adjuntar máximo ${maxFiles} archivos.`,
        variant: "destructive",
      })
      return
    }

    for (let i = 0; i < Math.min(fileList.length, remainingSlots); i++) {
      const file = fileList[i]
      
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: `El archivo "${file.name}" excede el tamaño máximo de ${maxSize}MB.`,
          variant: "destructive",
        })
        continue
      }

      try {
        const content = await readFileAsBase64(file)
        const attachedFile: AttachedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: content,
        }
        newFiles.push(attachedFile)
      } catch (error) {
        toast({
          title: "Error al procesar archivo",
          description: `No se pudo procesar el archivo "${file.name}".`,
          variant: "destructive",
        })
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
      
      toast({
        title: "Archivos adjuntados",
        description: `${newFiles.length} archivo${newFiles.length > 1 ? 's' : ''} adjuntado${newFiles.length > 1 ? 's' : ''} correctamente.`,
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (fileList) {
      processFiles(fileList)
    }
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = ''
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const fileList = e.dataTransfer.files
    if (fileList) {
      processFiles(fileList)
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-3">
      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.md"
        disabled={disabled}
      />

      {/* Drop zone */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Imágenes, PDF, documentos de texto (máx. {maxFiles} archivos, {maxSize}MB cada uno)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                openFileDialog()
              }}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Seleccionar archivos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attached files list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Archivos adjuntos ({files.length}/{maxFiles})
              </p>
              <Badge variant="secondary">
                {files.reduce((total, file) => total + file.size, 0) > 1024 * 1024 
                  ? `${(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)}MB`
                  : `${(files.reduce((total, file) => total + file.size, 0) / 1024).toFixed(0)}KB`
                }
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  layout
                >
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning if approaching limit */}
      {files.length >= maxFiles - 1 && files.length < maxFiles && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Solo puedes adjuntar {maxFiles - files.length} archivo{maxFiles - files.length > 1 ? 's' : ''} más</span>
        </div>
      )}
    </div>
  )
}