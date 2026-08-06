import { defineEventHandler, getQuery, createError } from 'h3'
import { analisadorService } from '~/server/services/analisador.service'
import { handleDatabaseError } from '~/server/utils/errorHandler'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = (query.tipo as string) || 'lotofacil'

  if (!['lotofacil', 'lotomania'].includes(tipo)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de loteria inválido.' })
  }

  try {
    const atrasos = await analisadorService.calcularAtrasos(tipo)
    return { data: atrasos }
  } catch (error) {
    handleDatabaseError(error)
  }
})
