import { db } from '../database'
import { concursos } from '../database/schema'
import { eq, desc } from 'drizzle-orm'
import type { EstatisticasGerais } from '~/types'
import { cached } from '../utils/cache'

/**
 * Serviço de análise estatística dos concursos.
 * Carrega apenas os números sorteados (evita SELECT *) e cacheia o conjunto
 * base por tipo de loteria, reaproveitado por frequências, atrasos e stats.
 */
export class AnalisadorService {
  /** Carrega os números sorteados dos concursos (mais recentes primeiro), com cache. */
  private async carregarSorteios(tipo: string): Promise<number[][]> {
    return cached(`analise:sorteios:${tipo}`, 300, async () => {
      const results = await db
        .select({ numerosSorteados: concursos.numerosSorteados })
        .from(concursos)
        .where(eq(concursos.tipoLoteria, tipo))
        .orderBy(desc(concursos.numeroConcurso))
        .limit(1000)
      return results.map((r) => r.numerosSorteados as number[])
    })
  }

  async calcularFrequencias(tipo: string): Promise<Record<number, number>> {
    const sorteios = await this.carregarSorteios(tipo)

    const frequencias: Record<number, number> = {}
    for (const numeros of sorteios) {
      for (const numero of numeros) {
        frequencias[numero] = (frequencias[numero] || 0) + 1
      }
    }

    return frequencias
  }

  async calcularAtrasos(tipo: string): Promise<Record<number, number>> {
    const results = await this.carregarSorteios(tipo)

    const maxNumero = tipo === 'lotofacil' ? 25 : 99
    const inicio = tipo === 'lotofacil' ? 1 : 0
    const atrasos: Record<number, number> = {}

    for (let i = inicio; i <= maxNumero; i++) {
      atrasos[i] = results.length
    }

    for (let idx = 0; idx < results.length; idx++) {
      const numeros = results[idx]!
      for (const numero of numeros) {
        if (atrasos[numero] === results.length) {
          atrasos[numero] = idx
        }
      }
    }

    return atrasos
  }

  async estatisticasGerais(tipo: string): Promise<EstatisticasGerais> {
    const sorteios = await this.carregarSorteios(tipo)

    const frequencias: Record<number, number> = {}
    for (const numeros of sorteios) {
      for (const numero of numeros) {
        frequencias[numero] = (frequencias[numero] || 0) + 1
      }
    }

    const sortedEntries = Object.entries(frequencias)
      .map(([k, v]) => [Number(k), v] as [number, number])
      .sort((a, b) => b[1] - a[1])

    const maisFrequentes = Object.fromEntries(sortedEntries.slice(0, 10))
    const menosFrequentes = Object.fromEntries(sortedEntries.slice(-10).reverse())

    const stats: EstatisticasGerais = {
      totalConcursos: sorteios.length,
      maisFrequentes,
      menosFrequentes,
      frequencias,
    }

    return stats
  }
}

export const analisadorService = new AnalisadorService()
