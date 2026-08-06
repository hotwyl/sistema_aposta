import { defineEventHandler, getQuery, createError } from 'h3'
import { db } from '~/server/database'
import { concursos } from '~/server/database/schema'
import { desc, eq, count } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = query.tipo as string | undefined

  if (tipo && !['lotofacil', 'lotomania'].includes(tipo)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de loteria inválido.' })
  }

  const conditions = tipo ? eq(concursos.tipoLoteria, tipo) : undefined

  try {
    const results = await db.select().from(concursos)
      .where(conditions)
      .orderBy(desc(concursos.numeroConcurso))

    return { data: results }
  } catch (error) {
    handleDatabaseError(error)
  }
})
