import { z } from 'zod'

export const tipoLoteriaSchema = z.enum(['lotofacil', 'lotomania'])

export const createApostaSchema = z.object({
  tipoLoteria: tipoLoteriaSchema,
  numeros: z.array(z.number().int().min(0)).min(1),
  valorAposta: z.number().min(0).default(0),
  isFavorita: z.boolean().default(false),
  observacoes: z.string().max(500).nullable().optional(),
  dataAposta: z.string().nullable().optional(),
  concursoId: z.string().uuid().nullable().optional(),
}).refine((data) => {
  if (data.tipoLoteria === 'lotofacil') {
    return data.numeros.length >= 15 && data.numeros.length <= 20
      && data.numeros.every(n => n >= 1 && n <= 25)
  }
  if (data.tipoLoteria === 'lotomania') {
    return data.numeros.length === 50
      && data.numeros.every(n => n >= 0 && n <= 99)
  }
  return false
}, {
  message: 'Quantidade ou faixa de números inválida para o tipo de loteria selecionado.',
})

export const updateApostaSchema = z.object({
  tipoLoteria: tipoLoteriaSchema.optional(),
  numeros: z.array(z.number().int().min(0)).optional(),
  valorAposta: z.number().min(0).optional(),
  isFavorita: z.boolean().optional(),
  observacoes: z.string().max(500).nullable().optional(),
  dataAposta: z.string().nullable().optional(),
  concursoId: z.string().uuid().nullable().optional(),
})

export const simuladorSchema = z.object({
  tipoLoteria: tipoLoteriaSchema,
  estrategia: z.enum(['aleatorio', 'frequencia', 'avancada', 'precisao']).default('aleatorio'),
  quantidadeJogos: z.number().int().min(1).max(20).default(5),
  quantidadeNumeros: z.number().int().min(15).max(20).default(15),
})

export const conferenciaSchema = z.object({
  tipoLoteria: tipoLoteriaSchema,
  numeros: z.string().min(1, 'Informe os números para conferir.'),
  numeroConcurso: z.number().int().min(1).nullable().optional(),
})

export const importadorSchema = z.object({
  tipoLoteria: tipoLoteriaSchema,
})
