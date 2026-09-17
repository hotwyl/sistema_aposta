import { defineEventHandler, getQuery } from 'h3'
import { db } from '~/server/database'
import { concursos } from '~/server/database/schema'
import { eq, desc } from 'drizzle-orm'
import { createIAService } from '~/server/services/ia.service'

/**
 * GET /api/estatisticas/analise-ia?tipo=lotofacil
 * Retorna análise e dicas geradas por IA baseadas nas estatísticas.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tipo = (query.tipo as string) || 'lotofacil'

  const iaService = createIAService()

  if (!iaService.isConfigured()) {
    return { data: { disponivel: false, mensagem: 'IA não configurada.' } }
  }

  try {
    const todosConcursos = await db.select().from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))
      .limit(50)

    if (todosConcursos.length < 5) {
      return { data: { disponivel: false, mensagem: 'Importe pelo menos 5 concursos para análise.' } }
    }

    const maxNumero = tipo === 'lotofacil' ? 25 : 99
    const inicio = tipo === 'lotofacil' ? 1 : 0

    // Calcular frequências
    const frequencias: Record<number, number> = {}
    for (let i = inicio; i <= maxNumero; i++) frequencias[i] = 0
    for (const conc of todosConcursos) {
      for (const n of conc.numerosSorteados as number[]) {
        frequencias[n] = (frequencias[n] || 0) + 1
      }
    }

    const sorted = Object.entries(frequencias)
      .map(([n, f]) => ({ numero: Number(n), freq: f }))
      .sort((a, b) => b.freq - a.freq)

    const quentes = sorted.slice(0, 8).map(e => String(e.numero).padStart(2, '0')).join(', ')
    const frios = sorted.slice(-8).map(e => String(e.numero).padStart(2, '0')).join(', ')

    // Últimos 5 sorteios
    const ultimos = todosConcursos.slice(0, 5).map(c => (c.numerosSorteados as number[]).map(n => String(n).padStart(2, '0')).join(', '))

    const prompt = `Analise os dados estatísticos da ${tipo === 'lotofacil' ? 'Lotofácil' : 'Lotomania'} e forneça insights e dicas.

DADOS (últimos ${todosConcursos.length} concursos):
- Números QUENTES (mais sorteados): ${quentes}
- Números FRIOS (menos sorteados): ${frios}
- Últimos 5 sorteios: ${ultimos.join(' | ')}

Responda em JSON com este formato exato:
{
  "resumo": "resumo de 1-2 frases da situação atual",
  "dicas": ["dica 1", "dica 2", "dica 3", "dica 4"],
  "numerosRecomendados": ["01","02","03","04","05"],
  "numerosEvitar": ["01","02","03"],
  "tendencia": "alta|estável|incerta"
}`

    const resultado = await iaService.gerarAposta(prompt)

    if (!resultado) {
      return { data: { disponivel: false, mensagem: 'Falha na comunicação com IA.' } }
    }

    // Parse response
    let analise: any = null
    try {
      const clean = resultado.resposta.replace(/```json?\s*/g, '').replace(/```/g, '').trim()
      analise = JSON.parse(clean)
    } catch {
      analise = {
        resumo: resultado.resposta.substring(0, 200),
        dicas: ['Analise os números quentes e frios antes de apostar.'],
        numerosRecomendados: [],
        numerosEvitar: [],
        tendencia: 'incerta',
      }
    }

    return {
      data: {
        disponivel: true,
        provider: resultado.provider,
        tipo,
        totalConcursos: todosConcursos.length,
        analise,
      },
    }
  } catch {
    return { data: { disponivel: false, mensagem: 'Erro ao gerar análise.' } }
  }
})
