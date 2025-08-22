'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Star, 
  Leaf, 
  Home, 
  ChevronDown,
  Palette,
  Cpu,
  Zap
} from 'lucide-react'

type Theme = 'star-wars' | 'ghibli' | 'simpsons' | 'claude' | 'doom64'

interface ThemeInfo {
  id: Theme
  name: string
  icon: React.ReactNode
  description: string
  cssFile: string
  font: string
}

const themes: ThemeInfo[] = [
  {
    id: 'star-wars',
    name: 'Star Wars',
    icon: <Star className="h-4 w-4" />,
    description: 'Estilo galáctico minimalista',
    cssFile: '/styles/star-wars.css',
    font: 'Orbitron, sans-serif'
  },
  {
    id: 'ghibli',
    name: 'Ghibli',
    icon: <Leaf className="h-4 w-4" />,
    description: 'Estudio Ghibli',
    cssFile: '/styles/ghibli.css',
    font: 'Noto Sans JP, sans-serif'
  },
  {
    id: 'simpsons',
    name: 'Los Simpson',
    icon: <Home className="h-4 w-4" />,
    description: 'Estilo animado clásico',
    cssFile: '/styles/simpsons.css',
    font: 'Comic Neue, cursive, sans-serif'
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: <Cpu className="h-4 w-4" />,
    description: 'Asistente IA elegante',
    cssFile: '/styles/claude.css',
    font: 'ui-sans-serif, system-ui, sans-serif'
  },
  {
    id: 'doom64',
    name: 'Doom 64',
    icon: <Zap className="h-4 w-4" />,
    description: 'Estilo retro gaming',
    cssFile: '/styles/doom64.css',
    font: 'Oxanium, sans-serif'
  }
]

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('star-wars')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Cargar tema guardado en localStorage
    const savedTheme = localStorage.getItem('chatico-theme') as Theme
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('star-wars')
    }
  }, [])

  const applyTheme = (theme: Theme) => {
    const themeInfo = themes.find(t => t.id === theme)
    if (!themeInfo) return

    // Remover todos los archivos CSS de tema
    document.querySelectorAll('link[data-theme]').forEach(link => {
      link.remove()
    })

    // Agregar nuevo archivo CSS de tema
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = themeInfo.cssFile
    link.setAttribute('data-theme', theme)
    document.head.appendChild(link)

    // Cambiar la fuente
    document.documentElement.style.fontFamily = themeInfo.font

    // Guardar en localStorage
    localStorage.setItem('chatico-theme', theme)

    // Forzar la recarga de estilos aplicando las clases a los componentes
    setTimeout(() => {
      updateComponentClasses(theme)
    }, 100)
  }

  const updateComponentClasses = (theme: Theme) => {
    // Actualizar clases de componentes según el tema
    const components = document.querySelectorAll('[data-theme-component]')
    components.forEach(component => {
      const componentType = component.getAttribute('data-theme-component')
      if (componentType) {
        // Remover clases de todos los temas
        component.classList.remove('star-wars-card', 'star-wars-input', 'star-wars-button', 'star-wars-gradient')
        component.classList.remove('ghibli-card', 'ghibli-input', 'ghibli-button', 'ghibli-gradient')
        component.classList.remove('simpsons-card', 'simpsons-input', 'simpsons-button', 'simpsons-gradient')
        component.classList.remove('claude-card', 'claude-input', 'claude-button', 'claude-gradient')
        component.classList.remove('doom64-card', 'doom64-input', 'doom64-button', 'doom64-gradient')
        
        // Agregar clases del nuevo tema
        component.classList.add(`${theme}-${componentType}`)
      }
    })
  }

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
  }

  if (!mounted) return null

  const currentThemeInfo = themes.find(t => t.id === currentTheme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-9">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{currentThemeInfo?.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className="gap-2 cursor-pointer"
          >
            {theme.icon}
            <div className="flex flex-col">
              <span className="font-medium">{theme.name}</span>
              <span className="text-xs text-muted-foreground">
                {theme.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}