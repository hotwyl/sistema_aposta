import { defineEventHandler, getQuery, createError } from 'h3'
import { db } from '~/server/database'
import { apostas, concursos } from '~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

/**
 * GET /api/apostas/ranking?tipo=lotofacil&concursoId=UUID
 *
 * Retorna ranking completo das apostas:
 * - Melhor aposta (mais acertos no concurso selecionado)
 * - Aposta com maior premiação
 * - Aposta com maior quantidade total de acertos históricos
 * - Todas apostas com acertos no concurso
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = (query.tipo as string) || 'lotofacil'
  const concursoId = query.concursoId as string | undefined

  if (!['lotofacil', 'lotomania'].includes(tipo)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de loteria inválido.' })
  }

  try {
    // Buscar concurso de referência (selecionado ou último)
    let concursoRef
    if (concursoId) {
      const results = await db.select().from(concursos).where(eq(concursos.id, concursoId)).limit(1)
      concursoRef = results[0]
    }
    if (!concursoRef) {
      const results = await db.select().from(concursos)
        .where(eq(concursos.tipoLoteria, tipo))
        .orderBy(desc(concursos.numeroConcurso))
        .limit(1)
      concursoRef = results[0]
    }

    if (!concursoRef) {
      return {
        data: {
          mensagem: 'Nenhum concurso encontrado. Importe os resultados primeiro.',
          concurso: null,
          ranking: [],
          melhorAposta: null,
          maiorPremiacao: null,
          maiorAcertosHistorico: null,
        },
      }
    }

    // Buscar todas as apostas do tipo
    const todasApostas = await db.select().from(apostas).where(eq(apostas.tipoLoteria, tipo))

    if (todasApostas.length === 0) {
      return {
        data: {
          mensagem: 'Nenhuma aposta encontrada. Registre apostas primeiro.',
          concurso: {
            id: concursoRef.id,
            numero: concursoRef.numeroConcurso,
            data: concursoRef.dataSorteio,
            numeros: concursoRef.numerosSorteados,
          },
          ranking: [],
          melhorAposta: null,
          maiorPremiacao: null,
          maiorAcertosHistorico: null,
        },
      }
    }

    const numerosSorteados = concursoRef.numerosSorteados as number[]

    // Calcular acertos de cada aposta no concurso de referência
    const ranking = todasApostas.map(aposta => {
      const nums = aposta.numeros as number[]
      const acertos = nums.filter(n => numerosSorteados.includes(n))
      const faixa = calcularFaixa(tipo, acertos.length, nums.length)

      return {
        id: aposta.id,
        numeros: nums,
        quantidadeNumeros: nums.length,
        acertos: acertos.sort((a, b) => a - b),
        quantidadeAcertos: acertos.length,
        faixa: faixa.faixa,
        temPremiacao: faixa.temPremiacao,
        isFavorita: aposta.isFavorita,
        dataAposta: aposta.dataAposta,
        observacoes: aposta.observacoes,
        createdAt: aposta.createdAt,
      }
    }).sort((a, b) => {
      // Primeiro por acertos, depois por quantidade de números (menor = mais difícil)
      if (b.quantidadeAcertos !== a.quantidadeAcertos) return b.quantidadeAcertos - a.quantidadeAcertos
      return a.quantidadeNumeros - b.quantidadeNumeros
    })

    // Melhor aposta (mais acertos no concurso)
    const melhorAposta = ranking[0] || null

    // Aposta com maior premiação (maior faixa)
    const comPremiacao = ranking.filter(r => r.temPremiacao)
    const maiorPremiacao = comPremiacao.length > 0 ? comPremiacao[0] : null

    // Buscar últimos 10 concursos para calcular acertos históricos
    const ultimosConcursos = await db.select().from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))
      .limit(10)

    // Calcular acertos totais históricos
    const acertosHistoricos = todasApostas.map(aposta => {
      const nums = aposta.numeros as number[]
      let totalAcertos = 0
      let melhorAcertoHistorico = 0
      let concursosComPremiacao = 0

      for (const conc of ultimosConcursos) {
        const numsSorteio = conc.numerosSorteados as number[]
        const acertos = nums.filter(n => numsSorteio.includes(n)).length
        totalAcertos += acertos
        if (acertos > melhorAcertoHistorico) melhorAcertoHistorico = acertos
        const faixa = calcularFaixa(tipo, acertos, nums.length)
        if (faixa.temPremiacao) concursosComPremiacao++
      }

      return {
        id: aposta.id,
        numeros: nums,
        totalAcertos,
        mediaAcertos: ultimosConcursos.length > 0 ? +(totalAcertos / ultimosConcursos.length).toFixed(1) : 0,
        melhorAcertoHistorico,
        concursosComPremiacao,
        concursosAnalisados: ultimosConcursos.length,
      }
    }).sort((a, b) => b.totalAcertos - a.totalAcertos)

    const maiorAcertosHistorico = acertosHistoricos[0] || null

    // Lista de concursos disponíveis para seleção (todos)
    const concursosDisponiveis = await db.select({
      id: concursos.id,
      numeroConcurso: concursos.numeroConcurso,
      dataSorteio: concursos.dataSorteio,
    }).from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))

    const resultado = {
      concurso: {
        id: concursoRef.id,
        numero: concursoRef.numeroConcurso,
        data: concursoRef.dataSorteio,
        numeros: numerosSorteados,
      },
      totalApostas: todasApostas.length,
      ranking: ranking.slice(0, 50), // Top 50
      melhorAposta,
      maiorPremiacao,
      maiorAcertosHistorico,
      acertosHistoricos: acertosHistoricos.slice(0, 10), // Top 10 histórico
      concursosDisponiveis,
    }

    return { data: resultado }
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

  // Lotomania
  if (acertos === 20) return { faixa: '1ª Faixa (20 acertos)', temPremiacao: true }
  if (acertos === 19) return { faixa: '2ª Faixa (19 acertos)', temPremiacao: true }
  if (acertos === 18) return { faixa: '3ª Faixa (18 acertos)', temPremiacao: true }
  if (acertos === 17) return { faixa: '4ª Faixa (17 acertos)', temPremiacao: true }
  if (acertos === 16) return { faixa: '5ª Faixa (16 acertos)', temPremiacao: true }
  if (acertos === 15) return { faixa: '6ª Faixa (15 acertos)', temPremiacao: true }
  if (acertos === 0) return { faixa: '7ª Faixa (0 acertos)', temPremiacao: true }
  return { faixa: `${acertos} acertos`, temPremiacao: false }
}
