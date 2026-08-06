import { db } from '../database'
import { concursos } from '../database/schema'
import { eq, desc } from 'drizzle-orm'
import type { EstatisticasGerais } from '~/types'

export class AnalisadorService {
  async calcularFrequencias(tipo: string): Promise<Record<number, number>> {
    const results = await db
      .select()
      .from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))
      .limit(1000)

    const frequencias: Record<number, number> = {}
    for (const concurso of results) {
      const numeros = concurso.numerosSorteados as number[]
      for (const numero of numeros) {
        frequencias[numero] = (frequencias[numero] || 0) + 1
      }
    }

    return frequencias
  }

  async calcularAtrasos(tipo: string): Promise<Record<number, number>> {
    const results = await db
      .select()
      .from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))
      .orderBy(desc(concursos.numeroConcurso))
      .limit(1000)

    const maxNumero = tipo === 'lotofacil' ? 25 : 99
    const inicio = tipo === 'lotofacil' ? 1 : 0
    const atrasos: Record<number, number> = {}

    for (let i = inicio; i <= maxNumero; i++) {
      atrasos[i] = results.length
    }

    for (let idx = 0; idx < results.length; idx++) {
      const numeros = results[idx]!.numerosSorteados as number[]
      for (const numero of numeros) {
        if (atrasos[numero] === results.length) {
          atrasos[numero] = idx
        }
      }
    }

    return atrasos
  }

  async estatisticasGerais(tipo: string): Promise<EstatisticasGerais> {
    const frequencias = await this.calcularFrequencias(tipo)

    const totalResults = await db
      .select()
      .from(concursos)
      .where(eq(concursos.tipoLoteria, tipo))

    const sortedEntries = Object.entries(frequencias)
      .map(([k, v]) => [Number(k), v] as [number, number])
      .sort((a, b) => b[1] - a[1])

    const maisFrequentes = Object.fromEntries(sortedEntries.slice(0, 10))
    const menosFrequentes = Object.fromEntries(sortedEntries.slice(-10).reverse())

    const stats: EstatisticasGerais = {
      totalConcursos: totalResults.length,
      maisFrequentes,
      menosFrequentes,
      frequencias,
    }

    return stats
  }
}

export const analisadorService = new AnalisadorService()
