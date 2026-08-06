import { defineEventHandler, getQuery, createError } from 'h3'
import { db } from '~/server/database'
import { apostas } from '~/server/database/schema'
import { eq, inArray } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

/**
 * DELETE /api/apostas/duplicatas?tipo=lotofacil
 * Remove apostas duplicadas mantendo a mais antiga de cada grupo.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = (query.tipo as string) || 'lotofacil'

  if (!['lotofacil', 'lotomania'].includes(tipo)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de loteria inválido.' })
  }

  try {
    const todasApostas = await db
      .select()
      .from(apostas)
      .where(eq(apostas.tipoLoteria, tipo))

    const hashMap = new Map<string, typeof todasApostas>()

    for (const aposta of todasApostas) {
      const numeros = (aposta.numeros as number[]).slice().sort((a, b) => a - b)
      const hash = numeros.join('-')
      if (!hashMap.has(hash)) hashMap.set(hash, [])
      hashMap.get(hash)!.push(aposta)
    }

    const idsRemover: string[] = []

    for (const [, itens] of hashMap) {
      if (itens.length > 1) {
        const sorted = itens.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        idsRemover.push(...sorted.slice(1).map(a => a.id))
      }
    }

    if (idsRemover.length === 0) {
      return {
        data: { removidas: 0 },
        message: 'Nenhuma aposta duplicada encontrada.',
      }
    }

    await db.delete(apostas).where(inArray(apostas.id, idsRemover))

    return {
      data: { removidas: idsRemover.length },
      message: `${idsRemover.length} apostas duplicadas removidas com sucesso.`,
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
