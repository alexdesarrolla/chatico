import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatSettings {
  temperature: number
  maxTokens: number
  thinkingMode: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatStore {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  settings: ChatSettings
  isGenerating: boolean
  
  // Actions
  setCurrentSession: (session: ChatSession | null) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  clearMessages: () => void
  createNewSession: (title?: string) => ChatSession
  deleteSession: (sessionId: string) => void
  updateSettings: (settings: Partial<ChatSettings>) => void
  setIsGenerating: (isGenerating: boolean) => void
  
  // Streaming
  startStreaming: (messageId: string) => void
  appendToStreamingMessage: (messageId: string, content: string) => void
  stopStreaming: (messageId: string) => void
}

const defaultSettings: ChatSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  thinkingMode: false,
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      settings: defaultSettings,
      isGenerating: false,

      setCurrentSession: (session) => {
        set({ currentSession: session })
      },

      addMessage: (message) => {
        const currentSession = get().currentSession
        if (!currentSession) return

        const updatedSession = {
          ...currentSession,
          messages: [...currentSession.messages, message],
          updatedAt: new Date(),
        }

        set((state) => ({
          currentSession: updatedSession,
          sessions: state.sessions.map((s) =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }))
      },

      updateMessage: (messageId, updates) => {
        const currentSession = get().currentSession
        if (!currentSession) return

        const updatedSession = {
          ...currentSession,
          messages: currentSession.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
          updatedAt: new Date(),
        }

        set((state) => ({
          currentSession: updatedSession,
          sessions: state.sessions.map((s) =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }))
      },

      removeMessage: (messageId) => {
        const currentSession = get().currentSession
        if (!currentSession) return

        const updatedSession = {
          ...currentSession,
          messages: currentSession.messages.filter((msg) => msg.id !== messageId),
          updatedAt: new Date(),
        }

        set((state) => ({
          currentSession: updatedSession,
          sessions: state.sessions.map((s) =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }))
      },

      clearMessages: () => {
        const currentSession = get().currentSession
        if (!currentSession) return

        const updatedSession = {
          ...currentSession,
          messages: [],
          updatedAt: new Date(),
        }

        set((state) => ({
          currentSession: updatedSession,
          sessions: state.sessions.map((s) =>
            s.id === currentSession.id ? updatedSession : s
          ),
        }))
      },

      createNewSession: (title = 'Nueva conversación') => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          currentSession: newSession,
          sessions: [newSession, ...state.sessions],
        }))

        return newSession
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession,
        }))
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      setIsGenerating: (isGenerating) => {
        set({ isGenerating })
      },

      startStreaming: (messageId) => {
        get().updateMessage(messageId, { isStreaming: true })
      },

      appendToStreamingMessage: (messageId, content) => {
        const currentSession = get().currentSession
        if (!currentSession) return

        const message = currentSession.messages.find((msg) => msg.id === messageId)
        if (!message) return

        const updatedContent = message.content + content
        get().updateMessage(messageId, { content: updatedContent })
      },

      stopStreaming: (messageId) => {
        get().updateMessage(messageId, { isStreaming: false })
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
      }),
    }
  )
)