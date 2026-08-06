import { defineEventHandler, getRouterParam, createError } from 'h3'
import { db } from '~/server/database'
import { apostas } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { handleDatabaseError } from '~/server/utils/errorHandler'

const uuidSchema = z.string().uuid('ID inválido.')

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório.' })
  }

  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'ID com formato inválido.' })
  }

  try {
    const existing = await db.select().from(apostas).where(eq(apostas.id, id)).limit(1)
    if (!existing[0]) {
      throw createError({ statusCode: 404, statusMessage: 'Aposta não encontrada.' })
    }

    await db.delete(apostas).where(eq(apostas.id, id))

    return { message: 'Aposta excluída com sucesso!' }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
