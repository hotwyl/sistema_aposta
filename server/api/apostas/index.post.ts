import { defineEventHandler, readBody, createError } from 'h3'
import { db } from '~/server/database'
import { apostas } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { createApostaSchema } from '~/server/utils/validators'
import { handleDatabaseError } from '~/server/utils/errorHandler'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parsed = createApostaSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Dados inválidos',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const data = parsed.data
  const numeros = [...data.numeros].sort((a, b) => a - b)
  const id = crypto.randomUUID()

  try {
    await db.insert(apostas).values({
      id,
      tipoLoteria: data.tipoLoteria,
      numeros,
      quantidadeNumeros: numeros.length,
      valorAposta: String(data.valorAposta),
      isFavorita: data.isFavorita,
      observacoes: data.observacoes || null,
      dataAposta: data.dataAposta || null,
      concursoId: data.concursoId || null,
    })

    const [aposta] = await db.select().from(apostas).where(eq(apostas.id, id)).limit(1)

    return { data: aposta, message: 'Aposta registrada com sucesso!' }
  } catch (error) {
    handleDatabaseError(error)
  }
})
