import { defineEventHandler, getQuery, createError } from 'h3'
import { db } from '~/server/database'
import { apostas } from '~/server/database/schema'
import { eq } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

/**
 * GET /api/apostas/duplicatas?tipo=lotofacil
 * Identifica apostas com números idênticos.
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

      if (!hashMap.has(hash)) {
        hashMap.set(hash, [])
      }
      hashMap.get(hash)!.push(aposta)
    }

    const grupos: Array<{
      numeros: number[]
      quantidade: number
      manterId: string
      removerIds: string[]
    }> = []

    let totalDuplicatas = 0

    for (const [, itens] of hashMap) {
      if (itens.length > 1) {
        // Manter a mais antiga (primeiro item por createdAt)
        const sorted = itens.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        const removerIds = sorted.slice(1).map(a => a.id)
        totalDuplicatas += removerIds.length

        grupos.push({
          numeros: sorted[0]!.numeros as number[],
          quantidade: itens.length,
          manterId: sorted[0]!.id,
          removerIds,
        })
      }
    }

    return {
      data: {
        tipo,
        totalApostas: todasApostas.length,
        totalDuplicatas,
        grupos,
      },
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
