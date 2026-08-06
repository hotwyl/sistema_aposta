import { defineEventHandler } from 'h3'
import { db } from '../../database'
import { sql } from 'drizzle-orm'

/**
 * GET /api/admin/health
 * Health check detalhado.
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

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy')

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks,
  }
})
