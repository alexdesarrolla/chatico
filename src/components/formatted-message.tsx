"use client"

import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'

interface FormattedMessageProps {
  content: string
  isStreaming?: boolean
}

export function FormattedMessage({ content, isStreaming }: FormattedMessageProps) {
  const [components, setComponents] = useState<Components | null>(null)

  useEffect(() => {
    // Cargar dinámicamente los componentes que requieren highlight.js
    const loadComponents = async () => {
      try {
        // Importar estilos CSS dinámicamente
        if (typeof window !== 'undefined') {
          try {
            await import('highlight.js/styles/github-dark.css')
          } catch (cssError) {
            console.warn('Could not load highlight.js styles, using fallback:', cssError)
          }
        }

        const customComponents: Components = {
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          pre({ children }) {
            return (
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
                {children}
              </pre>
            )
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-2">
                {children}
              </blockquote>
            )
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-inside my-2 space-y-1">
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside my-2 space-y-1">
                {children}
              </ol>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-border">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2">
                {children}
              </td>
            )
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mt-4 mb-2">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold mt-3 mb-2">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-medium mt-2 mb-1">
                {children}
              </h3>
            )
          },
          p({ children }) {
            return (
              <p className="mb-2 leading-relaxed">
                {children}
              </p>
            )
          },
          strong({ children }) {
            return (
              <strong className="font-semibold">
                {children}
              </strong>
            )
          },
          em({ children }) {
            return (
              <em className="italic">
                {children}
              </em>
            )
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                className="text-primary hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },
        }

        setComponents(customComponents)
      } catch (error) {
        console.error('Error loading components:', error)
        
        // Componentes de fallback sin highlight.js
        const fallbackComponents: Components = {
          code({ node, inline, className, children, ...props }) {
            return (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          pre({ children }) {
            return (
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
                {children}
              </pre>
            )
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-2">
                {children}
              </blockquote>
            )
          },
          ul({ children }) {
            return (
              <ul className="list-disc list-inside my-2 space-y-1">
                {children}
              </ul>
            )
          },
          ol({ children }) {
            return (
              <ol className="list-decimal list-inside my-2 space-y-1">
                {children}
              </ol>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border border-border">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="border border-border px-4 py-2">
                {children}
              </td>
            )
          },
          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mt-4 mb-2">
                {children}
              </h1>
            )
          },
          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold mt-3 mb-2">
                {children}
              </h2>
            )
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-medium mt-2 mb-1">
                {children}
              </h3>
            )
          },
          p({ children }) {
            return (
              <p className="mb-2 leading-relaxed">
                {children}
              </p>
            )
          },
          strong({ children }) {
            return (
              <strong className="font-semibold">
                {children}
              </strong>
            )
          },
          em({ children }) {
            return (
              <em className="italic">
                {children}
              </em>
            )
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                className="text-primary hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },
        }
        
        setComponents(fallbackComponents)
      }
    }

    loadComponents()
  }, [])

  if (!components) {
    // Mostrar contenido plano mientras se cargan los componentes
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-flex items-center ml-1">
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5"></span>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.4s' }}></span>
            </span>
          )}
        </p>
      </div>
    )
  }

  if (!components) {
    // Mostrar contenido plano mientras se cargan los componentes
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-flex items-center ml-1">
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5"></span>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.4s' }}></span>
            </span>
          )}
        </p>
      </div>
    )
  }

  try {
    // Asegurarse de que remarkPlugins sea un array válido
    const remarkPlugins = [remarkGfm].filter(Boolean)
    
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-flex items-center ml-1">
            <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5"></span>
            <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.4s' }}></span>
          </span>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error rendering ReactMarkdown:', error)
    // Fallback a texto plano si hay un error en el renderizado
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-flex items-center ml-1">
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5"></span>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-current rounded-full animate-pulse mx-0.5" style={{ animationDelay: '0.4s' }}></span>
            </span>
          )}
        </p>
      </div>
    )
  }
}