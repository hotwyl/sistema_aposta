import { db } from '../database'
import { concursos } from '../database/schema'
import { eq, desc, and } from 'drizzle-orm'
import type { ResultadoConferencia } from '~/types'

export class ConferenciaService {
  async conferirNumeros(
    numeros: number[],
    tipoLoteria: string,
    numeroConcurso?: number | null
  ): Promise<ResultadoConferencia | { error: string }> {
    let concurso

    if (numeroConcurso) {
      const results = await db
        .select()
        .from(concursos)
        .where(
          and(
            eq(concursos.numeroConcurso, numeroConcurso),
            eq(concursos.tipoLoteria, tipoLoteria)
          )
        )
        .limit(1)
      concurso = results[0]
    } else {
      const results = await db
        .select()
        .from(concursos)
        .where(eq(concursos.tipoLoteria, tipoLoteria))
        .orderBy(desc(concursos.numeroConcurso))
        .limit(1)
      concurso = results[0]
    }

    if (!concurso) {
      return { error: 'Concurso não encontrado. Importe os dados primeiro.' }
    }

    const numerosSorteados = concurso.numerosSorteados as number[]
    const acertos = numeros.filter(n => numerosSorteados.includes(n)).sort((a, b) => a - b)

    return {
      numeroConcurso: concurso.numeroConcurso,
      dataSorteio: concurso.dataSorteio,
      numerosConferidos: numeros,
      numerosSorteados,
      acertos,
      quantidadeAcertos: acertos.length,
      premiacao: this.calcularPremiacao(tipoLoteria, acertos.length, numeros.length),
    }
  }

  private calcularPremiacao(tipo: string, acertos: number, totalApostados: number): string {
    if (tipo === 'lotofacil') {
      if (acertos === 15 && totalApostados === 15) return '1ª Faixa (15 acertos)'
      if (acertos === 14) return '2ª Faixa (14 acertos)'
      if (acertos === 13) return '3ª Faixa (13 acertos)'
      if (acertos === 12) return '4ª Faixa (12 acertos)'
      if (acertos === 11) return '5ª Faixa (11 acertos)'
      return 'Sem premiação'
    }

    if (acertos === 20) return '1ª Faixa (20 acertos)'
    if (acertos === 19) return '2ª Faixa (19 acertos)'
    if (acertos === 18) return '3ª Faixa (18 acertos)'
    if (acertos === 17) return '4ª Faixa (17 acertos)'
    if (acertos === 16) return '5ª Faixa (16 acertos)'
    if (acertos === 15) return '6ª Faixa (15 acertos)'
    if (acertos === 0) return '7ª Faixa (0 acertos)'
    return 'Sem premiação'
  }
}

export const conferenciaService = new ConferenciaService()
