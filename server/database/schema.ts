import { mysqlTable, varchar, int, json, decimal, boolean, date, text, timestamp, uniqueIndex, index } from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const concursos = mysqlTable('concursos', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  numeroConcurso: int('numero_concurso').notNull(),
  tipoLoteria: varchar('tipo_loteria', { length: 20 }).notNull().default('lotofacil'),
  dataSorteio: date('data_sorteio').notNull(),
  numerosSorteados: json('numeros_sorteados').notNull().$type<number[]>(),
  premioPrincipal: decimal('premio_principal', { precision: 15, scale: 2 }).notNull().default('0'),
  acumulou: boolean('acumulou').notNull().default(false),
  valorAcumulado: decimal('valor_acumulado', { precision: 15, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => [
  uniqueIndex('concursos_numero_tipo_unique').on(table.numeroConcurso, table.tipoLoteria),
  index('concursos_tipo_loteria_idx').on(table.tipoLoteria),
  index('concursos_data_sorteio_idx').on(table.dataSorteio),
])

export const apostas = mysqlTable('apostas', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  concursoId: varchar('concurso_id', { length: 36 }).references(() => concursos.id, { onDelete: 'set null' }),
  tipoLoteria: varchar('tipo_loteria', { length: 20 }).notNull().default('lotofacil'),
  numeros: json('numeros').notNull().$type<number[]>(),
  quantidadeNumeros: int('quantidade_numeros').notNull(),
  valorAposta: decimal('valor_aposta', { precision: 10, scale: 2 }).notNull().default('0'),
  isFavorita: boolean('is_favorita').notNull().default(false),
  observacoes: text('observacoes'),
  dataAposta: date('data_aposta'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => [
  index('apostas_tipo_loteria_idx').on(table.tipoLoteria),
  index('apostas_is_favorita_idx').on(table.isFavorita),
  index('apostas_data_aposta_idx').on(table.dataAposta),
  index('apostas_concurso_id_idx').on(table.concursoId),
])
