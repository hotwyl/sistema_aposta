import { defineEventHandler, getRouterParam, createError } from 'h3'
import { db } from '~/server/database'
import { apostas, concursos } from '~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'
import { handleDatabaseError } from '~/server/utils/errorHandler'

const uuidSchema = z.string().uuid('ID inválido.')

/**
 * GET /api/apostas/:id/stats
 * Retorna aposta com estatísticas, métricas, histórico de acertos e premiações.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório.' })
  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'ID com formato inválido.' })

  try {
    const results = await db.select().from(apostas).where(eq(apostas.id, id)).limit(1)
    const aposta = results[0]
    if (!aposta) throw createError({ statusCode: 404, statusMessage: 'Aposta não encontrada.' })

    const nums = aposta.numeros as number[]
    const tipo = aposta.tipoLoteria

    // Buscar todos os concursos do mesmo tipo
    const todosConcursos = await db.select().from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))

    // Calcular acertos em cada concurso
    const historico = todosConcursos.map(conc => {
      const sorteados = conc.numerosSorteados as number[]
      const acertos = nums.filter(n => sorteados.includes(n))
      const faixa = calcularFaixa(tipo, acertos.length, nums.length)

      return {
        concursoId: conc.id,
        numeroConcurso: conc.numeroConcurso,
        dataSorteio: conc.dataSorteio,
        acertos: acertos.sort((a, b) => a - b),
        quantidadeAcertos: acertos.length,
        faixa: faixa.faixa,
        temPremiacao: faixa.temPremiacao,
      }
    })

    // Premiações (concursos onde teve premiação)
    const premiacoes = historico.filter(h => h.temPremiacao)

    // Métricas
    const totalConcursos = historico.length
    const totalAcertos = historico.reduce((sum, h) => sum + h.quantidadeAcertos, 0)
    const mediaAcertos = totalConcursos > 0 ? +(totalAcertos / totalConcursos).toFixed(2) : 0
    const melhorAcerto = historico.length > 0 ? Math.max(...historico.map(h => h.quantidadeAcertos)) : 0
    const piorAcerto = historico.length > 0 ? Math.min(...historico.map(h => h.quantidadeAcertos)) : 0
    const totalPremiacoes = premiacoes.length
    const percentualPremiacao = totalConcursos > 0 ? +((totalPremiacoes / totalConcursos) * 100).toFixed(1) : 0

    // Distribuição de acertos
    const distribuicao: Record<number, number> = {}
    for (const h of historico) {
      distribuicao[h.quantidadeAcertos] = (distribuicao[h.quantidadeAcertos] || 0) + 1
    }

    // Sequência atual (últimos concursos sem premiação)
    let sequenciaSemPremiacao = 0
    for (const h of historico) {
      if (h.temPremiacao) break
      sequenciaSemPremiacao++
    }

    // Frequência de acerto de cada número apostado
    const frequenciaAcertos = nums.map(n => {
      const vezes = historico.filter(h => h.acertos.includes(n)).length
      return {
        numero: n,
        vezes,
        percentual: totalConcursos > 0 ? +((vezes / totalConcursos) * 100).toFixed(1) : 0,
      }
    }).sort((a, b) => b.vezes - a.vezes)

    return {
      data: {
        aposta,
        metricas: {
          totalConcursos,
          totalAcertos,
          mediaAcertos,
          melhorAcerto,
          piorAcerto,
          totalPremiacoes,
          percentualPremiacao,
          sequenciaSemPremiacao,
        },
        distribuicao: Object.entries(distribuicao)
          .map(([acertos, vezes]) => ({ acertos: Number(acertos), vezes }))
          .sort((a, b) => b.acertos - a.acertos),
        frequenciaAcertos,
        premiacoes: premiacoes.slice(0, 30),
        historico: historico.slice(0, 20),
      },
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})

function calcularFaixa(tipo: string, acertos: number, totalApostados: number): { faixa: string; temPremiacao: boolean } {
  if (tipo === 'lotofacil') {
    if (acertos >= 15 && totalApostados === 15) return { faixa: '1ª Faixa (15 acertos)', temPremiacao: true }
    if (acertos === 14) return { faixa: '2ª Faixa (14 acertos)', temPremiacao: true }
    if (acertos === 13) return { faixa: '3ª Faixa (13 acertos)', temPremiacao: true }
    if (acertos === 12) return { faixa: '4ª Faixa (12 acertos)', temPremiacao: true }
    if (acertos === 11) return { faixa: '5ª Faixa (11 acertos)', temPremiacao: true }
    return { faixa: `${acertos} acertos`, temPremiacao: false }
  }
  if (acertos === 20) return { faixa: '1ª Faixa (20 acertos)', temPremiacao: true }
  if (acertos === 19) return { faixa: '2ª Faixa (19 acertos)', temPremiacao: true }
  if (acertos === 18) return { faixa: '3ª Faixa (18 acertos)', temPremiacao: true }
  if (acertos === 17) return { faixa: '4ª Faixa (17 acertos)', temPremiacao: true }
  if (acertos === 16) return { faixa: '5ª Faixa (16 acertos)', temPremiacao: true }
  if (acertos === 15) return { faixa: '6ª Faixa (15 acertos)', temPremiacao: true }
  if (acertos === 0) return { faixa: '7ª Faixa (0 acertos)', temPremiacao: true }
  return { faixa: `${acertos} acertos`, temPremiacao: false }
}
