import { defineEventHandler } from 'h3'
import { db } from '~/server/database'
import { apostas, concursos } from '~/server/database/schema'
import { eq, count, desc } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

/**
 * GET /api/estatisticas
 * Dashboard com métricas completas do sistema.
 */
export default defineEventHandler(async () => {
  try {
    const [
      totalApostasResult,
      lotofacilResult,
      lotomaniaResult,
      totalConcursosResult,
      concursosLotofacilResult,
      concursosLotomaniaResult,
      favoritasResult,
      ultimoLotofacil,
      ultimoLotomania,
      todasApostas,
      ultimosConcursos,
    ] = await Promise.all([
      db.select({ count: count() }).from(apostas),
      db.select({ count: count() }).from(apostas).where(eq(apostas.tipoLoteria, 'lotofacil')),
      db.select({ count: count() }).from(apostas).where(eq(apostas.tipoLoteria, 'lotomania')),
      db.select({ count: count() }).from(concursos),
      db.select({ count: count() }).from(concursos).where(eq(concursos.tipoLoteria, 'lotofacil')),
      db.select({ count: count() }).from(concursos).where(eq(concursos.tipoLoteria, 'lotomania')),
      db.select({ count: count() }).from(apostas).where(eq(apostas.isFavorita, true)),
      db.select({ numeroConcurso: concursos.numeroConcurso, dataSorteio: concursos.dataSorteio })
        .from(concursos).where(eq(concursos.tipoLoteria, 'lotofacil')).orderBy(desc(concursos.numeroConcurso)).limit(1),
      db.select({ numeroConcurso: concursos.numeroConcurso, dataSorteio: concursos.dataSorteio })
        .from(concursos).where(eq(concursos.tipoLoteria, 'lotomania')).orderBy(desc(concursos.numeroConcurso)).limit(1),
      db.select().from(apostas).orderBy(desc(apostas.createdAt)).limit(100),
      db.select().from(concursos).where(eq(concursos.tipoLoteria, 'lotofacil')).orderBy(desc(concursos.numeroConcurso)).limit(10),
    ])

    // Calcular taxa de premiação das apostas lotofacil
    let totalPremiacoes = 0
    let melhorAcertoGeral = 0

    if (todasApostas.length > 0 && ultimosConcursos.length > 0) {
      for (const aposta of todasApostas.filter(a => a.tipoLoteria === 'lotofacil')) {
        const nums = aposta.numeros as number[]
        for (const conc of ultimosConcursos) {
          const sorteados = conc.numerosSorteados as number[]
          const acertos = nums.filter(n => sorteados.includes(n)).length
          if (acertos >= 11) totalPremiacoes++
          if (acertos > melhorAcertoGeral) melhorAcertoGeral = acertos
        }
      }
    }

    // Top 5 números mais quentes (lotofacil)
    const frequencias: Record<number, number> = {}
    for (let i = 1; i <= 25; i++) frequencias[i] = 0
    for (const conc of ultimosConcursos) {
      for (const n of conc.numerosSorteados as number[]) {
        frequencias[n] = (frequencias[n] || 0) + 1
      }
    }
    const numerosQuentes = Object.entries(frequencias)
      .map(([n, f]) => ({ numero: Number(n), freq: f }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 5)

    const stats = {
      totalApostas: totalApostasResult[0]?.count || 0,
      apostasLotofacil: lotofacilResult[0]?.count || 0,
      apostasLotomania: lotomaniaResult[0]?.count || 0,
      totalConcursos: totalConcursosResult[0]?.count || 0,
      concursosLotofacil: concursosLotofacilResult[0]?.count || 0,
      concursosLotomania: concursosLotomaniaResult[0]?.count || 0,
      favoritas: favoritasResult[0]?.count || 0,
      ultimoConcursoLotofacil: ultimoLotofacil[0] || null,
      ultimoConcursoLotomania: ultimoLotomania[0] || null,
      // Métricas avançadas
      totalPremiacoes,
      melhorAcertoGeral,
      taxaPremiacao: todasApostas.length > 0 && ultimosConcursos.length > 0
        ? +((totalPremiacoes / (todasApostas.filter(a => a.tipoLoteria === 'lotofacil').length * ultimosConcursos.length)) * 100).toFixed(1)
        : 0,
      numerosQuentes,
    }

    return { data: stats }
  } catch (error) {
    handleDatabaseError(error)
  }
})
