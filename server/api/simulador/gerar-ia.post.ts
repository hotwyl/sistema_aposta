import { defineEventHandler, readBody, createError } from 'h3'
import { createIAService } from '~/server/services/ia.service'
import { analisadorService } from '~/server/services/analisador.service'
import { handleDatabaseError } from '~/server/utils/errorHandler'
import { z } from 'zod'

const schema = z.object({
  tipoLoteria: z.enum(['lotofacil', 'lotomania']),
  quantidadeJogos: z.number().int().min(1).max(20).default(1),
  salvar: z.boolean().default(false),
})

/**
 * POST /api/simulador/gerar-ia
 * Gera uma aposta usando IA com base em estatísticas do histórico.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Dados inválidos.' })
  }

  const { tipoLoteria, quantidadeJogos } = parsed.data

  const iaService = createIAService()

  if (!iaService.isConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: '9Router não configurado. Defina NINEROUTER_URL e NINEROUTER_API_KEY nas variáveis de ambiente.',
    })
  }

  try {
    const frequencias = await analisadorService.calcularFrequencias(tipoLoteria)
    const totalSorteios = Object.values(frequencias).length > 0
      ? Math.max(...Object.values(frequencias))
      : 0

    if (totalSorteios === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nenhum sorteio encontrado. Importe concursos para usar a geração por IA.',
      })
    }

    // Buscar dados adicionais para enriquecer o prompt
    const { db } = await import('~/server/database')
    const { concursos } = await import('~/server/database/schema')
    const { eq, desc } = await import('drizzle-orm')

    const ultimosConcursos = await db.select({ numerosSorteados: concursos.numerosSorteados })
      .from(concursos)
      .where(eq(concursos.tipoLoteria, tipoLoteria))
      .orderBy(desc(concursos.numeroConcurso))
      .limit(10)

    // Gerar em lotes (máximo 3 jogos por chamada para não exceder tokens)
    const maxPorLote = tipoLoteria === 'lotofacil' ? 5 : 2
    const todosJogos: number[][] = []
    let tentativas = 0
    const maxTentativas = Math.ceil(quantidadeJogos / maxPorLote) + 2

    while (todosJogos.length < quantidadeJogos && tentativas < maxTentativas) {
      tentativas++
      const faltam = Math.min(maxPorLote, quantidadeJogos - todosJogos.length)
      const prompt = montarPrompt(tipoLoteria, frequencias, totalSorteios, faltam, ultimosConcursos)
      const resultado = await iaService.gerarAposta(prompt)

      if (!resultado) break

      const jogos = extrairJogos(resultado.resposta, tipoLoteria, faltam)
      if (jogos && jogos.length > 0) {
        for (const jogo of jogos) {
          if (todosJogos.length < quantidadeJogos) {
            todosJogos.push(jogo)
          }
        }
      } else {
        break // IA não retornou dados válidos, parar
      }
    }

    if (todosJogos.length === 0) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Falha ao comunicar com as APIs de IA. Verifique as configurações e tente novamente.',
      })
    }

    return {
      data: {
        sucesso: true,
        provider: `9Router (${useRuntimeConfig().nineRouterModel})`,
        tipo: tipoLoteria,
        numeros: todosJogos[0],
        jogos: todosJogos,
      },
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})

function montarPrompt(tipo: string, frequencias: Record<number, number>, totalSorteios: number, quantidade: number, ultimosConcursos: { numerosSorteados: unknown }[]): string {
  const sorted = Object.entries(frequencias)
    .map(([n, f]) => ({ numero: Number(n), freq: f }))
    .sort((a, b) => b.freq - a.freq)

  const top10 = sorted.slice(0, 10).map(e => `${String(e.numero).padStart(2, '0')}(${e.freq}x)`).join(', ')
  const bottom5 = sorted.slice(-5).map(e => `${String(e.numero).padStart(2, '0')}(${e.freq}x)`).join(', ')

  // Calcular atrasos
  const maxNumero = tipo === 'lotofacil' ? 25 : 99
  const inicio = tipo === 'lotofacil' ? 1 : 0
  const atrasos: { numero: number; atraso: number }[] = []
  for (let i = inicio; i <= maxNumero; i++) {
    let atraso = ultimosConcursos.length
    for (let idx = 0; idx < ultimosConcursos.length; idx++) {
      if ((ultimosConcursos[idx]!.numerosSorteados as number[]).includes(i)) {
        atraso = idx
        break
      }
    }
    if (atraso >= 3) atrasos.push({ numero: i, atraso })
  }
  atrasos.sort((a, b) => b.atraso - a.atraso)
  const maisAtrasados = atrasos.slice(0, 5).map(e => `${String(e.numero).padStart(2, '0')}(${e.atraso} conc.)`).join(', ')

  // Últimos 3 sorteios
  const ultimos3 = ultimosConcursos.slice(0, 3).map(c =>
    (c.numerosSorteados as number[]).map(n => String(n).padStart(2, '0')).join(','),
  ).join(' | ')

  // Par/ímpar do último
  const ultimoNums = ultimosConcursos[0]?.numerosSorteados as number[] || []
  const paresUltimo = ultimoNums.filter(n => n % 2 === 0).length
  const imparesUltimo = ultimoNums.length - paresUltimo

  // Repetições entre os últimos 2
  let repeticoes = 0
  if (ultimosConcursos.length >= 2) {
    const a = ultimosConcursos[0]!.numerosSorteados as number[]
    const b = ultimosConcursos[1]!.numerosSorteados as number[]
    repeticoes = a.filter(n => b.includes(n)).length
  }

  if (tipo === 'lotofacil') {
    return `Gere ${quantidade} aposta(s) DIFERENTES para a Lotofácil com MÁXIMA probabilidade de premiação.

ESTATÍSTICAS de ${totalSorteios} concursos:
- TOP 10 MAIS FREQUENTES: ${top10}
- 5 MENOS FREQUENTES: ${bottom5}
- MAIORES ATRASOS: ${maisAtrasados}
- ÚLTIMOS 3 SORTEIOS: ${ultimos3}
- ÚLTIMO PADRÃO: ${paresUltimo}P/${imparesUltimo}I, ${repeticoes} repetições do anterior

REGRAS ESTATÍSTICAS para maximizar chance de premiação:
1. Exatamente 15 números DISTINTOS entre 01 e 25
2. Distribuição par/ímpar: 7/8 ou 8/7 (padrão mais frequente)
3. Incluir 8-10 números do TOP 10 mais frequentes
4. Incluir 2-4 números em atraso (estatisticamente "devidos")
5. Manter 7-9 repetições com o último concurso
6. Cobertura de TODAS as faixas: 1-5, 6-10, 11-15, 16-20, 21-25 (mínimo 2 de cada)
7. Cada aposta DIFERENTE das outras

Responda APENAS com JSON válido:
{"jogos": [["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15"]${quantidade > 1 ? ', ...' : ''}]}`
  }

  return `Gere ${quantidade} aposta(s) DIFERENTES para a Lotomania com MÁXIMA probabilidade de premiação.

ESTATÍSTICAS de ${totalSorteios} concursos:
- TOP 10 MAIS FREQUENTES: ${top10}
- 5 MENOS FREQUENTES: ${bottom5}
- MAIORES ATRASOS: ${maisAtrasados}
- ÚLTIMOS 3 SORTEIOS: ${ultimos3}

REGRAS ESTATÍSTICAS:
1. Exatamente 50 números DISTINTOS entre 00 e 99
2. Incluir 15-20 números do TOP frequentes
3. Incluir 5-10 números em atraso
4. Distribuição equilibrada entre dezenas (0-9, 10-19, ..., 90-99)
5. Cada aposta DIFERENTE das outras

Responda APENAS com JSON válido:
{"jogos": [["00","01","02",...,"49"]${quantidade > 1 ? ', ...' : ''}]}`
}

function extrairJogos(resposta: string, tipo: string, quantidadeEsperada: number): number[][] | null {
  let clean = resposta.replace(/```json?\s*/g, '').replace(/```/g, '').trim()

  // Tentar parse JSON
  try {
    const json = JSON.parse(clean)

    // Formato {"jogos": [[...],...]}
    if (json?.jogos && Array.isArray(json.jogos)) {
      const jogos: number[][] = []
      for (const jogo of json.jogos) {
        const nums = validarJogo(jogo, tipo)
        if (nums) jogos.push(nums)
      }
      if (jogos.length > 0) return jogos.slice(0, quantidadeEsperada)
    }

    // Formato {"numeros": [...]} (single game)
    if (json?.numeros && Array.isArray(json.numeros)) {
      const nums = validarJogo(json.numeros, tipo)
      if (nums) return [nums]
    }

    // Formato array direto [[...], [...]]
    if (Array.isArray(json) && json.length > 0) {
      if (Array.isArray(json[0])) {
        const jogos: number[][] = []
        for (const jogo of json) {
          const nums = validarJogo(jogo, tipo)
          if (nums) jogos.push(nums)
        }
        if (jogos.length > 0) return jogos.slice(0, quantidadeEsperada)
      } else {
        const nums = validarJogo(json, tipo)
        if (nums) return [nums]
      }
    }
  } catch { /* fallback regex */ }

  // Fallback: extrair números via regex
  const matches = clean.match(/\b(\d{1,2})\b/g)
  if (matches) {
    const numeros = [...new Set(matches.map(n => parseInt(n, 10)))].filter(n => !isNaN(n))
    numeros.sort((a, b) => a - b)

    if (tipo === 'lotofacil') {
      const valid = numeros.filter(n => n >= 1 && n <= 25)
      if (valid.length >= 15) return [valid.slice(0, 15)]
    }
    if (tipo === 'lotomania') {
      const valid = numeros.filter(n => n >= 0 && n <= 99)
      if (valid.length >= 50) return [valid.slice(0, 50)]
    }
  }

  return null
}

function validarJogo(arr: unknown[], tipo: string): number[] | null {
  const numeros = arr.map((n: unknown) => parseInt(String(n), 10)).filter((n: number) => !isNaN(n))
  const unique = [...new Set(numeros)] as number[]
  unique.sort((a, b) => a - b)

  if (tipo === 'lotofacil' && unique.length === 15 && unique.every(n => n >= 1 && n <= 25)) {
    return unique
  }
  if (tipo === 'lotomania' && unique.length === 50 && unique.every(n => n >= 0 && n <= 99)) {
    return unique
  }
  // Tolerância: se tem pelo menos a quantidade mínima
  if (tipo === 'lotofacil') {
    const valid = unique.filter(n => n >= 1 && n <= 25)
    if (valid.length >= 15) return valid.slice(0, 15)
  }
  if (tipo === 'lotomania') {
    const valid = unique.filter(n => n >= 0 && n <= 99)
    if (valid.length >= 50) return valid.slice(0, 50)
  }
  return null
}
