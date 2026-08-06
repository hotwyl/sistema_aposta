import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { db } from '~/server/database'
import { apostas } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { updateApostaSchema } from '~/server/utils/validators'
import { z } from 'zod'
import { handleDatabaseError } from '~/server/utils/errorHandler'

const uuidSchema = z.string().uuid('ID inválido.')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório.' })
  }

  const uuidParsed = uuidSchema.safeParse(id)
  if (!uuidParsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'ID com formato inválido.' })
  }

  const body = await readBody(event)
  const parsed = updateApostaSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Dados inválidos',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  try {
    const existing = await db.select().from(apostas).where(eq(apostas.id, id)).limit(1)
    if (!existing[0]) {
      throw createError({ statusCode: 404, statusMessage: 'Aposta não encontrada.' })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (data.tipoLoteria) updateData.tipoLoteria = data.tipoLoteria
    if (data.numeros) {
      updateData.numeros = [...data.numeros].sort((a, b) => a - b)
      updateData.quantidadeNumeros = data.numeros.length
    }
    if (data.valorAposta !== undefined) updateData.valorAposta = String(data.valorAposta)
    if (data.isFavorita !== undefined) updateData.isFavorita = data.isFavorita
    if (data.observacoes !== undefined) updateData.observacoes = data.observacoes
    if (data.dataAposta !== undefined) updateData.dataAposta = data.dataAposta
    if (data.concursoId !== undefined) updateData.concursoId = data.concursoId

    const [updated] = await db.update(apostas).set(updateData).where(eq(apostas.id, id))

    const [result] = await db.select().from(apostas).where(eq(apostas.id, id)).limit(1)

    return { data: result, message: 'Aposta atualizada com sucesso!' }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
