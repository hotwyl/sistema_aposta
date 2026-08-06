import { defineEventHandler, readBody, createError } from 'h3'
import { db } from '~/server/database'
import { concursos } from '~/server/database/schema'
import { and, eq } from 'drizzle-orm'
import { handleDatabaseError } from '~/server/utils/errorHandler'
import { z } from 'zod'

const schema = z.object({
  numeroConcurso: z.number().int().min(1),
  tipoLoteria: z.enum(['lotofacil', 'lotomania']),
  dataSorteio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve ser no formato YYYY-MM-DD.'),
  numerosSorteados: z.array(z.number().int().min(0)),
  premioPrincipal: z.number().min(0).default(0),
  acumulou: z.boolean().default(false),
  valorAcumulado: z.number().min(0).default(0),
}).refine((data) => {
  if (data.tipoLoteria === 'lotofacil') {
    return data.numerosSorteados.length === 15 && data.numerosSorteados.every(n => n >= 1 && n <= 25)
  }
  if (data.tipoLoteria === 'lotomania') {
    return data.numerosSorteados.length === 20 && data.numerosSorteados.every(n => n >= 0 && n <= 99)
  }
  return false
}, { message: 'Quantidade ou faixa de números inválida para o tipo de loteria.' })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 422, statusMessage: 'Dados inválidos', data: parsed.error.flatten().fieldErrors })
  }

  const data = parsed.data

  try {
    // Verificar duplicata
    const existing = await db.select({ id: concursos.id }).from(concursos)
      .where(and(eq(concursos.numeroConcurso, data.numeroConcurso), eq(concursos.tipoLoteria, data.tipoLoteria)))
      .limit(1)

    if (existing.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'Concurso já cadastrado.' })
    }

    const numeros = [...data.numerosSorteados].sort((a, b) => a - b)
    const id = crypto.randomUUID()

    await db.insert(concursos).values({
      id,
      numeroConcurso: data.numeroConcurso,
      tipoLoteria: data.tipoLoteria,
      dataSorteio: data.dataSorteio,
      numerosSorteados: numeros,
      premioPrincipal: String(data.premioPrincipal),
      acumulou: data.acumulou,
      valorAcumulado: String(data.valorAcumulado),
    })

    const [concurso] = await db.select().from(concursos).where(eq(concursos.id, id)).limit(1)

    return { data: concurso, message: 'Concurso cadastrado com sucesso!' }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    handleDatabaseError(error)
  }
})
