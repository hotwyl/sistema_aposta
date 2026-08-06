export interface Aposta {
  id: string
  concursoId: string | null
  tipoLoteria: 'lotofacil' | 'lotomania'
  numeros: number[]
  quantidadeNumeros: number
  valorAposta: number
  isFavorita: boolean
  observacoes: string | null
  dataAposta: string | null
  createdAt: string
  updatedAt: string
}

export interface Concurso {
  id: string
  numeroConcurso: number
  tipoLoteria: 'lotofacil' | 'lotomania'
  dataSorteio: string
  numerosSorteados: number[]
  premioPrincipal: number
  acumulou: boolean
  valorAcumulado: number
  createdAt: string
  updatedAt: string
}

export interface ResultadoConferencia {
  numeroConcurso: number
  dataSorteio: string
  numerosConferidos: number[]
  numerosSorteados: number[]
  acertos: number[]
  quantidadeAcertos: number
  premiacao: string
}

export interface EstatisticasGerais {
  totalConcursos: number
  maisFrequentes: Record<number, number>
  menosFrequentes: Record<number, number>
  frequencias: Record<number, number>
}

export interface ResultadoSimulacao {
  jogos: number[][]
  tipo: 'lotofacil' | 'lotomania'
  estrategia: string
}

export interface ResultadoImportacao {
  importados: number
  duplicados: number
  erros: number
  totalLinhas: number
}

export type TipoLoteria = 'lotofacil' | 'lotomania'

export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}
