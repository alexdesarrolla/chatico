// Script para inicializar el tema por defecto
export function initializeTheme() {
  if (typeof window !== 'undefined') {
    // Verificar si ya hay un tema guardado
    const savedTheme = localStorage.getItem('chatico-theme')
    
    if (!savedTheme) {
      // Si no hay tema guardado, aplicar Star Wars por defecto
      const defaultTheme = 'star-wars'
      localStorage.setItem('chatico-theme', defaultTheme)
      
      // Cargar el CSS del tema Star Wars
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/styles/star-wars.css'
      link.setAttribute('data-theme', defaultTheme)
      document.head.appendChild(link)
      
      // Establecer la fuente por defecto
      document.documentElement.style.fontFamily = 'Orbitron'
    } else {
      // Cargar el tema guardado
      const themeInfo = getThemeInfo(savedTheme)
      if (themeInfo) {
        // Remover todos los archivos CSS de tema
        document.querySelectorAll('link[data-theme]').forEach(link => {
          link.remove()
        })
        
        // Agregar nuevo archivo CSS de tema
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = themeInfo.cssFile
        link.setAttribute('data-theme', savedTheme)
        document.head.appendChild(link)
        
        // Cambiar la fuente
        document.documentElement.style.fontFamily = themeInfo.font
      }
    }
  }
}

function getThemeInfo(theme: string) {
  const themes = {
    'star-wars': {
      cssFile: '/styles/star-wars.css',
      font: 'Orbitron, sans-serif'
    },
    'ghibli': {
      cssFile: '/styles/ghibli.css',
      font: 'Noto Sans JP, sans-serif'
    },
    'simpsons': {
      cssFile: '/styles/simpsons.css',
      font: 'Comic Neue, cursive, sans-serif'
    },
    'claude': {
      cssFile: '/styles/claude.css',
      font: 'ui-sans-serif, system-ui, sans-serif'
    },
    'doom64': {
      cssFile: '/styles/doom64.css',
      font: 'Oxanium, sans-serif'
    }
  }
  
  return themes[theme as keyof typeof themes]
}