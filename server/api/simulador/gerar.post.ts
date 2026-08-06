import { defineEventHandler, readBody, createError } from 'h3'
import { simuladorService } from '~/server/services/simulador.service'
import { analisadorService } from '~/server/services/analisador.service'
import { simuladorSchema } from '~/server/utils/validators'
import { handleDatabaseError } from '~/server/utils/errorHandler'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = simuladorSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Dados inválidos',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { tipoLoteria, estrategia, quantidadeJogos, quantidadeNumeros } = parsed.data

  try {
    let jogos: number[][]

    if (estrategia === 'avancada' || estrategia === 'precisao') {
      jogos = []
      const { db } = await import('~/server/database')
      const { concursos } = await import('~/server/database/schema')
      const { eq, desc } = await import('drizzle-orm')

      const dadosConcursos = await db.select({ numerosSorteados: concursos.numerosSorteados })
        .from(concursos)
        .where(eq(concursos.tipoLoteria, tipoLoteria))
        .orderBy(desc(concursos.numeroConcurso))
        .limit(50)

      for (let i = 0; i < quantidadeJogos; i++) {
        const quantidade = tipoLoteria === 'lotofacil' ? quantidadeNumeros : 50
        const jogo = simuladorService.gerarPrecisao(
          tipoLoteria,
          dadosConcursos as { numerosSorteados: number[] }[],
          quantidade,
        )
        jogos.push(jogo)
      }
    } else if (estrategia === 'frequencia') {
      const frequencias = await analisadorService.calcularFrequencias(tipoLoteria)
      jogos = []
      for (let i = 0; i < quantidadeJogos; i++) {
        const quantidade = tipoLoteria === 'lotofacil' ? quantidadeNumeros : 50
        jogos.push(simuladorService.gerarPorFrequencia(tipoLoteria, frequencias, quantidade))
      }
    } else {
      jogos = simuladorService.gerarMultiplos(tipoLoteria, quantidadeJogos, quantidadeNumeros)
    }

    return {
      data: {
        jogos,
        tipo: tipoLoteria,
        estrategia,
      },
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
