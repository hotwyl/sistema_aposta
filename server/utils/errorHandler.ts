import { createError } from 'h3'

/**
 * Verifica se o erro é de conexão com banco de dados
 * e retorna um erro HTTP amigável.
 */
export function handleDatabaseError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error)

  console.error('[DB Error]', message)

  if (message.includes('ECONNREFUSED') || message.includes('connect_timeout') || message.includes('connection refused')) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Serviço de banco de dados indisponível. Tente novamente em instantes.',
    })
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Erro interno do servidor. Tente novamente.',
  })
}

/**
 * Handler genérico para erros de serviço.
 */
export function handleServiceError(error: unknown, service: string): never {
  const message = error instanceof Error ? error.message : String(error)

  console.error(JSON.stringify({
    level: 'error',
    service,
    error: message,
    timestamp: new Date().toISOString(),
  }))

  throw createError({
    statusCode: 500,
    statusMessage: `Erro no serviço ${service}. Tente novamente.`,
  })
}
