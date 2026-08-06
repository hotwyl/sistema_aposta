import { defineEventHandler, getQuery, createError } from 'h3'
import { db } from '~/server/database'
import { concursos } from '~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

/**
 * GET /api/analisador/completo?tipo=lotofacil
 *
 * Retorna análise completa:
 * - Ranking números mais sorteados
 * - Ranking números mais atrasados
 * - Distribuição par/ímpar com porcentagens
 * - Repetições entre concursos consecutivos
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = (query.tipo as string) || 'lotofacil'

  if (!['lotofacil', 'lotomania'].includes(tipo)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de loteria inválido.' })
  }

  try {
    const todosConcursos = await db.select().from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))

    if (todosConcursos.length === 0) {
      return { data: { mensagem: 'Nenhum concurso encontrado. Importe os resultados primeiro.', totalConcursos: 0 } }
    }

    const totalConcursos = todosConcursos.length
    const maxNumero = tipo === 'lotofacil' ? 25 : 99
    const inicio = tipo === 'lotofacil' ? 1 : 0
    const qtdPorSorteio = tipo === 'lotofacil' ? 15 : 20

    // 1. Frequência de cada número
    const frequencias: Record<number, number> = {}
    for (let i = inicio; i <= maxNumero; i++) frequencias[i] = 0

    for (const conc of todosConcursos) {
      for (const n of conc.numerosSorteados as number[]) {
        frequencias[n] = (frequencias[n] || 0) + 1
      }
    }

    // Ranking mais sorteados
    const maisSorteados = Object.entries(frequencias)
      .map(([n, f]) => ({ numero: Number(n), frequencia: f, percentual: +((f / totalConcursos) * 100).toFixed(1) }))
      .sort((a, b) => b.frequencia - a.frequencia)

    // 2. Atrasos (últimos concursos sem aparecer)
    const atrasos: Record<number, number> = {}
    for (let i = inicio; i <= maxNumero; i++) atrasos[i] = totalConcursos

    for (let idx = 0; idx < todosConcursos.length; idx++) {
      const nums = todosConcursos[idx]!.numerosSorteados as number[]
      for (const n of nums) {
        if (atrasos[n] === totalConcursos) {
          atrasos[n] = idx
        }
      }
    }

    // Ranking mais atrasados
    const maisAtrasados = Object.entries(atrasos)
      .map(([n, a]) => ({ numero: Number(n), atraso: a }))
      .sort((a, b) => b.atraso - a.atraso)

    // 3. Distribuição par/ímpar
    const distribuicaoParImpar: Record<string, number> = {}
    for (const conc of todosConcursos) {
      const nums = conc.numerosSorteados as number[]
      const pares = nums.filter(n => n % 2 === 0).length
      const impares = nums.length - pares
      const chave = `${pares}P/${impares}I`
      distribuicaoParImpar[chave] = (distribuicaoParImpar[chave] || 0) + 1
    }

    const parImpar = Object.entries(distribuicaoParImpar)
      .map(([combinacao, ocorrencias]) => ({
        combinacao,
        pares: parseInt(combinacao.split('P')[0] || '0', 10),
        impares: parseInt((combinacao.split('/')[1] || '0I').replace('I', ''), 10),
        ocorrencias,
        percentual: +((ocorrencias / totalConcursos) * 100).toFixed(1),
      }))
      .sort((a, b) => b.ocorrencias - a.ocorrencias)

    // 4. Repetições entre concursos consecutivos
    const repeticoes: Record<number, number> = {}
    for (let i = 0; i < todosConcursos.length - 1; i++) {
      const atual = todosConcursos[i]!.numerosSorteados as number[]
      const proximo = todosConcursos[i + 1]!.numerosSorteados as number[]
      const qtdRepetidas = atual.filter(n => proximo.includes(n)).length
      repeticoes[qtdRepetidas] = (repeticoes[qtdRepetidas] || 0) + 1
    }

    const totalTransicoes = todosConcursos.length - 1
    const distribuicaoRepeticoes = Object.entries(repeticoes)
      .map(([qtd, ocorrencias]) => ({
        repeticoes: Number(qtd),
        ocorrencias,
        percentual: +((ocorrencias / totalTransicoes) * 100).toFixed(1),
      }))
      .sort((a, b) => b.repeticoes - a.repeticoes)

    const resultado = {
      tipo,
      totalConcursos,
      maisSorteados: maisSorteados.slice(0, 25),
      maisAtrasados: maisAtrasados.slice(0, 25),
      parImpar,
      distribuicaoRepeticoes,
    }

    return { data: resultado }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
