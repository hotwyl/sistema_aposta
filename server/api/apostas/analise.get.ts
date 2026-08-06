import { defineEventHandler, getQuery, createError } from 'h3'
import { db } from '~/server/database'
import { apostas, concursos } from '~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'

/**
 * GET /api/apostas/analise?tipo=lotofacil
 * Analisa o desempenho das apostas contra o histórico de sorteios.
 * Retorna: top apostas, sugestão baseada em frequência, distribuição par/ímpar.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = (query.tipo as string) || 'lotofacil'

  if (!['lotofacil', 'lotomania'].includes(tipo)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipo de loteria inválido.' })
  }

  try {
    const [todasApostas, todosSorteios] = await Promise.all([
      db.select().from(apostas).where(eq(apostas.tipoLoteria, tipo)),
      db.select().from(concursos).where(eq(concursos.tipoLoteria, tipo)).orderBy(desc(concursos.numeroConcurso)),
    ])

    if (todasApostas.length === 0 || todosSorteios.length === 0) {
      return {
        data: {
          mensagem: 'Dados insuficientes para análise. Registre apostas e importe concursos.',
          totalApostas: todasApostas.length,
          totalSorteios: todosSorteios.length,
        },
      }
    }

    const ultimoSorteio = todosSorteios[0]!
    const numerosUltimo = ultimoSorteio.numerosSorteados as number[]

    // Calcular acertos de cada aposta no último sorteio
    const acertosUltimo = todasApostas.map(aposta => {
      const nums = aposta.numeros as number[]
      const acertos = nums.filter(n => numerosUltimo.includes(n))
      return { apostaId: aposta.id, numeros: nums, acertos: acertos.length }
    }).sort((a, b) => b.acertos - a.acertos)

    // Top 5 no último sorteio
    const topUltimoSorteio = acertosUltimo.slice(0, 5)

    // Calcular acertos totais em todos os sorteios
    const acertosTotais = todasApostas.map(aposta => {
      const nums = aposta.numeros as number[]
      let total = 0
      for (const sorteio of todosSorteios) {
        const numsSorteio = sorteio.numerosSorteados as number[]
        total += nums.filter(n => numsSorteio.includes(n)).length
      }
      return { apostaId: aposta.id, numeros: nums, totalAcertos: total }
    }).sort((a, b) => b.totalAcertos - a.totalAcertos)

    const topTotalAcertos = acertosTotais.slice(0, 5)

    // Gerar aposta sugerida (números mais frequentes)
    const frequencias: Record<number, number> = {}
    for (const sorteio of todosSorteios) {
      for (const num of sorteio.numerosSorteados as number[]) {
        frequencias[num] = (frequencias[num] || 0) + 1
      }
    }

    const qtdNumeros = tipo === 'lotofacil' ? 15 : 50
    const sugeridos = Object.entries(frequencias)
      .map(([n, f]) => ({ numero: Number(n), freq: f }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, qtdNumeros)
      .map(e => e.numero)
      .sort((a, b) => a - b)

    // Verificar desempenho histórico da aposta sugerida
    const desempenhoSugerida = calcularDesempenho(sugeridos, todosSorteios)

    // Distribuição par/ímpar
    const distribuicaoParImpar: Record<string, number> = {}
    for (const sorteio of todosSorteios) {
      const nums = sorteio.numerosSorteados as number[]
      const pares = nums.filter(n => n % 2 === 0).length
      const impares = nums.length - pares
      const chave = `${pares}P/${impares}I`
      distribuicaoParImpar[chave] = (distribuicaoParImpar[chave] || 0) + 1
    }

    const parImparOrdenado = Object.entries(distribuicaoParImpar)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([combinacao, ocorrencias]) => ({
        combinacao,
        ocorrencias,
        percentual: `${((ocorrencias / todosSorteios.length) * 100).toFixed(1)}%`,
      }))

    const resultado = {
      tipo,
      totalApostas: todasApostas.length,
      totalSorteios: todosSorteios.length,
      ultimoSorteio: {
        concurso: ultimoSorteio.numeroConcurso,
        data: ultimoSorteio.dataSorteio,
        numeros: numerosUltimo,
      },
      topAcertosUltimoSorteio: topUltimoSorteio,
      topAcertosTotais: topTotalAcertos,
      apostaSugerida: {
        numeros: sugeridos,
        criterio: 'Números mais sorteados no histórico',
        desempenhoHistorico: desempenhoSugerida,
      },
      distribuicaoParImpar: parImparOrdenado,
    }

    return { data: resultado }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})

function calcularDesempenho(
  numeros: number[],
  sorteios: Array<{ numerosSorteados: unknown }>
): Array<{ acertos: number; vezes: number; percentual: string }> {
  const contagem: Record<number, number> = {}

  for (const sorteio of sorteios) {
    const numsSorteio = sorteio.numerosSorteados as number[]
    const acertos = numeros.filter(n => numsSorteio.includes(n)).length
    contagem[acertos] = (contagem[acertos] || 0) + 1
  }

  return Object.entries(contagem)
    .map(([acertos, vezes]) => ({
      acertos: Number(acertos),
      vezes,
      percentual: `${((vezes / sorteios.length) * 100).toFixed(1)}%`,
    }))
    .sort((a, b) => b.acertos - a.acertos)
}
