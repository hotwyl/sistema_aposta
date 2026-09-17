import { defineEventHandler } from 'h3'
import { useStorage } from '#imports'
import { db } from '../../database'
import { sql } from 'drizzle-orm'

/**
 * GET /api/admin/health
 * Health check detalhado (banco + cache/Redis).
 */
export default defineEventHandler(async () => {
  const checks: Record<string, { status: string; latency?: number; details?: string }> = {}

  // Check MariaDB
  try {
    const start = Date.now()
    await db.execute(sql`SELECT 1`)
    checks.database = { status: 'healthy', latency: Date.now() - start }
  } catch (error) {
    checks.database = { status: 'unhealthy', details: error instanceof Error ? error.message : 'unknown' }
  }

  // Check Redis (cache) - não bloqueia a saúde geral pois há degradação graciosa
  try {
    const start = Date.now()
    const store = useStorage('cache')
    await store.setItem('__health__', Date.now())
    await store.getItem('__health__')
    checks.cache = { status: 'healthy', latency: Date.now() - start }
  } catch (error) {
    checks.cache = { status: 'unhealthy', details: error instanceof Error ? error.message : 'unknown' }
  }

  // Saúde geral considera apenas o banco (cache é opcional/degradável).
  const allHealthy = checks.database?.status === 'healthy'

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks,
  }
})
