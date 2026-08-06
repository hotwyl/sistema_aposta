import { defineEventHandler, getMethod, createError } from 'h3'

/**
 * Middleware de sanitização - protege contra payloads excessivamente grandes
 * e valida Content-Type em requisições com body.
 */
export default defineEventHandler((event) => {
  const method = getMethod(event)
  const contentLength = event.headers.get('content-length')

  // Limitar tamanho do body (15MB para upload de CSV, 1MB para JSON)
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    const path = event.path || ''
    const maxSize = path.includes('/importador') ? 15 * 1024 * 1024 : 1024 * 1024

    if (size > maxSize) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Payload muito grande. Tamanho máximo excedido.',
      })
    }
  }

  // Validar Content-Type para métodos com body (exceto multipart)
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = event.headers.get('content-type') || ''
    const path = event.path || ''

    if (path.startsWith('/api/') && !path.includes('/importador')) {
      if (contentType && !contentType.includes('application/json')) {
        // Allow if no content-type (h3 default handling)
        if (contentType && !contentType.includes('text/plain')) {
          throw createError({
            statusCode: 415,
            statusMessage: 'Content-Type não suportado. Use application/json.',
          })
        }
      }
    }
  }
})
