/**
 * Serviço de geração de apostas com estratégias estatísticas avançadas.
 * Foca em maximizar probabilidade de premiação usando padrões reais.
 */
export class SimuladorService {
  /**
   * Geração aleatória pura.
   */
  gerarLotofacil(quantidade = 15): number[] {
    const numeros = Array.from({ length: 25 }, (_, i) => i + 1)
    this.shuffle(numeros)
    return numeros.slice(0, quantidade).sort((a, b) => a - b)
  }

  gerarLotomania(): number[] {
    const numeros = Array.from({ length: 100 }, (_, i) => i)
    this.shuffle(numeros)
    return numeros.slice(0, 50).sort((a, b) => a - b)
  }

  gerarMultiplos(tipo: string, jogos: number, quantidade = 15): number[][] {
    const resultados: number[][] = []
    for (let i = 0; i < jogos; i++) {
      resultados.push(tipo === 'lotofacil' ? this.gerarLotofacil(quantidade) : this.gerarLotomania())
    }
    return resultados
  }

  /**
   * Geração por frequência ponderada.
   * Números mais frequentes têm mais chance de serem selecionados.
   */
  gerarPorFrequencia(tipo: string, frequencias: Record<number, number>, quantidade = 15): number[] {
    const maxNumero = tipo === 'lotofacil' ? 25 : 99
    const inicio = tipo === 'lotofacil' ? 1 : 0

    // Criar pool com pesos baseados na frequência
    const entries = Object.entries(frequencias)
      .map(([n, f]) => ({ numero: Number(n), freq: f }))
      .filter(e => e.numero >= inicio && e.numero <= maxNumero)

    // Normalizar frequências para pesos (mínimo 1)
    const maxFreq = Math.max(...entries.map(e => e.freq), 1)
    const pool: { numero: number; peso: number }[] = entries.map(e => ({
      numero: e.numero,
      peso: Math.max(1, Math.round((e.freq / maxFreq) * 10)),
    }))

    // Seleção ponderada sem repetição
    const selecionados: number[] = []
    const disponivel = [...pool]

    while (selecionados.length < quantidade && disponivel.length > 0) {
      const totalPeso = disponivel.reduce((sum, p) => sum + p.peso, 0)
      let rand = Math.random() * totalPeso

      for (let i = 0; i < disponivel.length; i++) {
        rand -= disponivel[i]!.peso
        if (rand <= 0) {
          selecionados.push(disponivel[i]!.numero)
          disponivel.splice(i, 1)
          break
        }
      }
    }

    return selecionados.sort((a, b) => a - b)
  }

  /**
   * Estratégia de alta precisão - combina múltiplos critérios estatísticos.
   * Análise de: frequência, atraso, par/ímpar, faixas, repetições, sequências.
   */
  gerarPrecisao(
    tipo: string,
    concursos: { numerosSorteados: number[] }[],
    quantidade = 15,
  ): number[] {
    if (concursos.length < 5) {
      return tipo === 'lotofacil' ? this.gerarLotofacil(quantidade) : this.gerarLotomania()
    }

    const maxNumero = tipo === 'lotofacil' ? 25 : 99
    const inicio = tipo === 'lotofacil' ? 1 : 0
    const totalConc = concursos.length

    // 1. SCORE DE FREQUÊNCIA (peso 30%)
    const freqScore: Record<number, number> = {}
    for (let i = inicio; i <= maxNumero; i++) freqScore[i] = 0
    for (let idx = 0; idx < totalConc; idx++) {
      const peso = totalConc - idx // Recente = maior peso
      for (const n of concursos[idx]!.numerosSorteados) {
        freqScore[n] = (freqScore[n] || 0) + peso
      }
    }

    // 2. SCORE DE ATRASO (peso 25%) - números em atraso tendem a sair
    const atrasoScore: Record<number, number> = {}
    for (let i = inicio; i <= maxNumero; i++) {
      let atraso = totalConc
      for (let idx = 0; idx < totalConc; idx++) {
        if (concursos[idx]!.numerosSorteados.includes(i)) {
          atraso = idx
          break
        }
      }
      // Normalizar: atraso maior = score maior (até um limite)
      atrasoScore[i] = Math.min(atraso, 15)
    }

    // 3. PADRÃO PAR/ÍMPAR - distribuição ideal
    let totalPares = 0
    for (const conc of concursos.slice(0, 20)) {
      totalPares += conc.numerosSorteados.filter(n => n % 2 === 0).length
    }
    const mediaPares = Math.round(totalPares / Math.min(20, totalConc))
    const targetPares = mediaPares
    const targetImpares = quantidade - targetPares

    // 4. DISTRIBUIÇÃO POR FAIXA - cobertura uniforme
    const faixas = tipo === 'lotofacil'
      ? [[1, 5], [6, 10], [11, 15], [16, 20], [21, 25]]
      : [[0, 19], [20, 39], [40, 59], [60, 79], [80, 99]]
    const numPorFaixa = Math.ceil(quantidade / faixas.length)

    // 5. REPETIÇÕES - manter padrão histórico com último concurso
    let totalReps = 0
    for (let i = 0; i < Math.min(20, totalConc - 1); i++) {
      const atual = concursos[i]!.numerosSorteados
      const prox = concursos[i + 1]!.numerosSorteados
      totalReps += atual.filter(n => prox.includes(n)).length
    }
    const mediaReps = Math.round(totalReps / Math.min(20, totalConc - 1))

    // 6. CALCULAR SCORE COMBINADO para cada número
    const maxFreq = Math.max(...Object.values(freqScore), 1)
    const maxAtraso = Math.max(...Object.values(atrasoScore), 1)

    const scores: { numero: number; score: number; isPar: boolean; faixa: number }[] = []
    for (let i = inicio; i <= maxNumero; i++) {
      const freq = (freqScore[i] || 0) / maxFreq // 0 a 1
      const atraso = (atrasoScore[i] || 0) / maxAtraso // 0 a 1

      // Score combinado: frequência alta + atraso moderado é o sweet spot
      const score = (freq * 0.35) + (atraso * 0.25) + (Math.random() * 0.15) + 0.25

      const faixaIdx = faixas.findIndex(([min, max]) => i >= min! && i <= max!)
      scores.push({ numero: i, score, isPar: i % 2 === 0, faixa: faixaIdx })
    }

    // 7. SELEÇÃO INTELIGENTE
    const resultado: number[] = []

    // 7a. Garantir repetições do último concurso
    const ultimoNums = [...concursos[0]!.numerosSorteados]
    this.shuffle(ultimoNums)
    const repsDesejadas = Math.min(mediaReps, Math.ceil(quantidade * 0.4))
    for (const n of ultimoNums) {
      if (resultado.length >= repsDesejadas) break
      resultado.push(n)
    }

    // 7b. Separar restantes por par/ímpar com score
    const usados = new Set(resultado)
    const paresRestantes = scores.filter(s => s.isPar && !usados.has(s.numero)).sort((a, b) => b.score - a.score)
    const imparesRestantes = scores.filter(s => !s.isPar && !usados.has(s.numero)).sort((a, b) => b.score - a.score)

    const paresNoResultado = resultado.filter(n => n % 2 === 0).length
    const imparesNoResultado = resultado.length - paresNoResultado
    let faltaPares = Math.max(0, targetPares - paresNoResultado)
    let faltaImpares = Math.max(0, targetImpares - imparesNoResultado)

    // 7c. Preencher pares
    for (const s of paresRestantes) {
      if (faltaPares <= 0 || resultado.length >= quantidade) break
      resultado.push(s.numero)
      faltaPares--
    }

    // 7d. Preencher ímpares
    for (const s of imparesRestantes) {
      if (faltaImpares <= 0 || resultado.length >= quantidade) break
      resultado.push(s.numero)
      faltaImpares--
    }

    // 7e. Completar se necessário (melhores scores gerais)
    if (resultado.length < quantidade) {
      const usadosFinal = new Set(resultado)
      const restantes = scores.filter(s => !usadosFinal.has(s.numero)).sort((a, b) => b.score - a.score)
      for (const s of restantes) {
        if (resultado.length >= quantidade) break
        resultado.push(s.numero)
      }
    }

    // 7f. Verificar cobertura de faixas (swap se necessário)
    const final = resultado.slice(0, quantidade).sort((a, b) => a - b)
    return this.ajustarFaixas(final, faixas, scores, quantidade)
  }

  /**
   * Ajusta o jogo para garantir cobertura mínima de faixas.
   */
  private ajustarFaixas(
    jogo: number[],
    faixas: number[][],
    scores: { numero: number; score: number }[],
    quantidade: number,
  ): number[] {
    const resultado = [...jogo]
    const faixaCount = faixas.map(([min, max]) =>
      resultado.filter(n => n >= min! && n <= max!).length,
    )

    // Se alguma faixa tem 0, trocar o número com menor score por um dessa faixa
    for (let f = 0; f < faixas.length; f++) {
      if (faixaCount[f] === 0 && resultado.length >= quantidade) {
        const [fMin, fMax] = faixas[f]!
        const candidato = scores
          .filter(s => s.numero >= fMin! && s.numero <= fMax! && !resultado.includes(s.numero))
          .sort((a, b) => b.score - a.score)[0]

        if (candidato) {
          // Encontrar a faixa com mais números e remover o de menor score dela
          const faixaMaisCheia = faixaCount.indexOf(Math.max(...faixaCount))
          const [mMin, mMax] = faixas[faixaMaisCheia]!
          const numsFaixa = resultado.filter(n => n >= mMin! && n <= mMax!)
          const piores = numsFaixa.map(n => ({
            numero: n,
            score: scores.find(s => s.numero === n)?.score || 0,
          })).sort((a, b) => a.score - b.score)

          if (piores.length > 1) {
            const idx = resultado.indexOf(piores[0]!.numero)
            if (idx >= 0) {
              resultado[idx] = candidato.numero
              faixaCount[f]!++
              faixaCount[faixaMaisCheia]!--
            }
          }
        }
      }
    }

    return resultado.sort((a, b) => a - b)
  }

  private shuffle(array: number[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j]!, array[i]!]
    }
  }
}

export const simuladorService = new SimuladorService()
