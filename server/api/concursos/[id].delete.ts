import { defineEventHandler, getRouterParam, createError } from 'h3'
import { db } from '~/server/database'
import { concursos } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { handleDatabaseError } from '~/server/utils/errorHandler'

const uuidSchema = z.string().uuid()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !uuidSchema.safeParse(id).success) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido.' })
  }

  try {
    const existing = await db.select().from(concursos).where(eq(concursos.id, id)).limit(1)
    if (!existing[0]) {
      throw createError({ statusCode: 404, statusMessage: 'Concurso não encontrado.' })
    }

    await db.delete(concursos).where(eq(concursos.id, id))

    return { message: 'Concurso excluído com sucesso!' }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
