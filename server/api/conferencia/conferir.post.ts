import { defineEventHandler, readBody, createError } from 'h3'
import { conferenciaService } from '~/server/services/conferencia.service'
import { conferenciaSchema } from '~/server/utils/validators'
import { handleDatabaseError } from '~/server/utils/errorHandler'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = conferenciaSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Dados inválidos',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { tipoLoteria, numeros: numerosStr, numeroConcurso } = parsed.data

  // Parse dos números (aceita separados por vírgula, espaço ou ponto-e-vírgula)
  const numeros = numerosStr
    .split(/[\s,;]+/)
    .map(n => parseInt(n.trim(), 10))
    .filter(n => !isNaN(n) && n >= 0)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .sort((a, b) => a - b)

  if (numeros.length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Informe pelo menos um número válido.' })
  }

  try {
    const resultado = await conferenciaService.conferirNumeros(numeros, tipoLoteria, numeroConcurso)
    return { data: resultado }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
