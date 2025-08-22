import { NextRequest, NextResponse } from 'next/server'

const API_KEY = '07404a6111c34dc4ad2d693e789aceac.nGwBlpE4Zavv0p4Y'
const API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true, temperature = 0.3, maxTokens = 1024 } = await request.json()
    console.log('Chat API request:', { messages: messages.length, stream, temperature, maxTokens })

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('Invalid messages format')
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      )
    }

    // Validar el formato de los mensajes y optimizar para contexto más corto
    const validMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Limitar el contexto a las últimas 8 interacciones para mayor velocidad
    const optimizedMessages = validMessages.slice(-16)

    console.log('Making optimized request to Z.ai API...')

    if (stream) {
      // Streaming response con timeout más agresivo
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 30000) // 30 segundos timeout

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'es-CO,es',
          },
          body: JSON.stringify({
            model: 'glm-4.5-flash',
            messages: optimizedMessages,
            temperature: 0.3, // Menos temperatura para respuestas más rápidas
            max_tokens: 1024, // Menos tokens para respuestas más rápidas
            stream: true,
          }),
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)
        console.log('Z.ai API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Z.ai API error:', response.status, errorText)
          throw new Error(`API request failed: ${response.status} ${errorText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        
        const stream = new ReadableStream({
          async start(controller) {
            let buffer = '' // Buffer para acumular datos parciales
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk // Acumular datos en el buffer
                
                // Procesar líneas completas del buffer
                const lines = buffer.split('\n')
                buffer = lines.pop() || '' // Mantener la última línea incompleta en el buffer

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') {
                      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                      continue
                    }

                    try {
                      // Verificar si los datos son válidos antes de parsear
                      if (data && data.trim() !== '') {
                        const parsed = JSON.parse(data)
                        
                        const content = parsed.choices?.[0]?.delta?.content || ''
                        if (content) {
                          const responseChunk = {
                            choices: [{
                              delta: { content },
                              index: 0,
                            }],
                          }
                          
                          const payload = `data: ${JSON.stringify(responseChunk)}\n\n`
                          controller.enqueue(encoder.encode(payload))
                        }
                      }
                    } catch (e) {
                      // No lanzar el error, continuar con el siguiente chunk
                    }
                  }
                }
              }
              
              // Procesar cualquier dato restante en el buffer
              if (buffer.trim()) {
                const lines = buffer.split('\n')
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') {
                      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                      continue
                    }

                    try {
                      if (data && data.trim() !== '') {
                        const parsed = JSON.parse(data)
                        
                        const content = parsed.choices?.[0]?.delta?.content || ''
                        if (content) {
                          const responseChunk = {
                            choices: [{
                              delta: { content },
                              index: 0,
                            }],
                          }
                          
                          const payload = `data: ${JSON.stringify(responseChunk)}\n\n`
                          controller.enqueue(encoder.encode(payload))
                        }
                      }
                    } catch (e) {
                      // Ignorar errores en el procesamiento final
                    }
                  }
                }
              }

              console.log('Streaming completed')
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch (error) {
              console.error('Streaming error:', error)
              controller.error(error)
            } finally {
              reader.releaseLock()
            }
          },
        })

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        })
      } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.error('Request timeout')
          throw new Error('Request timeout')
        }
        throw error
      }
    } else {
      // Non-streaming response con timeout
      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), 20000) // 20 segundos timeout

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'es-CO,es',
          },
          body: JSON.stringify({
            model: 'glm-4.5-flash',
            messages: optimizedMessages,
            temperature: 0.3,
            max_tokens: 1024,
            stream: false,
          }),
          signal: abortController.signal,
        })

        clearTimeout(timeoutId)
        console.log('Z.ai API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Z.ai API error:', response.status, errorText)
          throw new Error(`API request failed: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log('Non-streaming completion successful')
        return NextResponse.json(data)
      } catch (error) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.error('Request timeout')
          throw new Error('Request timeout')
        }
        throw error
      }
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}