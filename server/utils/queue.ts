/**
 * Fila de jobs leve baseada no storage 'queue' (Redis) do Nitro.
 *
 * Objetivo: rastrear tarefas assíncronas (ex.: geração de apostas por IA, que
 * pode levar até ~90s) sem manter a requisição HTTP aberta e sem introduzir
 * um broker externo. Mantém-se propositalmente simples (SOLID/Clean Code):
 * - enqueue: registra o job como "pendente" e retorna um id
 * - setStatus/getStatus: atualiza e consulta o progresso/resultado
 *
 * Para apps maiores, trocar por BullMQ é direto pois a interface é isolada aqui.
 */
import { useStorage } from '#imports'

export type JobStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Job<TResult = unknown, TPayload = unknown> {
  id: string
  type: string
  status: JobStatus
  payload: TPayload
  result?: TResult
  error?: string
  createdAt: number
  updatedAt: number
}

function store() {
  return useStorage('queue')
}

const KEY = (id: string) => `job:${id}`
/** TTL lógico dos jobs (24h) para não acumular chaves indefinidamente. */
const JOB_TTL_MS = 24 * 60 * 60 * 1000

/** Cria um job com status inicial 'pending' e devolve o registro. */
export async function enqueue<TPayload>(type: string, payload: TPayload): Promise<Job<unknown, TPayload>> {
  const now = Date.now()
  const job: Job<unknown, TPayload> = {
    id: crypto.randomUUID(),
    type,
    status: 'pending',
    payload,
    createdAt: now,
    updatedAt: now,
  }
  await store().setItem(KEY(job.id), job)
  return job
}

/** Atualiza o status/resultado de um job existente. */
export async function setStatus(
  id: string,
  status: JobStatus,
  patch: { result?: unknown; error?: string } = {},
): Promise<void> {
  const current = (await store().getItem(KEY(id))) as Job | null
  if (!current) return
  const updated: Job = { ...current, status, ...patch, updatedAt: Date.now() }
  await store().setItem(KEY(id), updated)
}

/** Consulta um job, descartando registros expirados. */
export async function getStatus(id: string): Promise<Job | null> {
  const job = (await store().getItem(KEY(id))) as Job | null
  if (!job) return null
  if (Date.now() - job.createdAt > JOB_TTL_MS) {
    await store().removeItem(KEY(id))
    return null
  }
  return job
}

/**
 * Executa um trabalho assíncrono já registrado, atualizando o status ao longo
 * do ciclo de vida. Não aguarda (fire-and-forget) — o chamador recebe o id
 * imediatamente e consulta o resultado depois via getStatus.
 */
export function run<TResult>(id: string, worker: () => Promise<TResult>): void {
  void (async () => {
    try {
      await setStatus(id, 'processing')
      const result = await worker()
      await setStatus(id, 'done', { result })
    } catch (error) {
      await setStatus(id, 'error', { error: (error as Error)?.message || 'Erro desconhecido' })
    }
  })()
}
