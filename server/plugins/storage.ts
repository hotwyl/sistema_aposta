/**
 * Plugin Nitro: monta os storages 'cache' e 'queue' em Redis em RUNTIME.
 *
 * Por que runtime e não nuxt.config: a opção nitro.storage é resolvida em
 * build time, o que congela a REDIS_URL no bundle. Montando aqui, lemos a URL
 * de runtimeConfig (env do container), garantindo que o host correto ('redis'
 * no Docker) seja usado. Se a montagem falhar, a app segue com o storage
 * padrão em memória (degradação graciosa via server/utils/cache.ts).
 */
import redisDriver from 'unstorage/drivers/redis'
import { useRuntimeConfig } from '#imports'

export default defineNitroPlugin(() => {
  // REDIS_URL é lido diretamente do ambiente do processo (runtime no servidor).
  // O runtimeConfig só seria sobrescrito por NUXT_REDIS_URL, então usamos a env
  // padrão como fonte primária e o runtimeConfig como fallback.
  const config = useRuntimeConfig()
  const url = process.env.REDIS_URL || (config.redisUrl as string)

  if (!url) return

  const commonOptions = {
    url,
    // Falha operações rápido quando desconectado (o cache-aside cai na origem),
    // mas mantém a reconexão contínua e resiliente (backoff com teto de 3s),
    // para que o cache volte sozinho assim que o Redis estiver disponível.
    maxRetriesPerRequest: 2,
    retryStrategy: (times: number) => Math.min(times * 200, 3000),
  }

  try {
    const storage = useStorage()
    storage.mount('cache', redisDriver({ ...commonOptions, base: 'cache', ttl: 300 }))
    storage.mount('queue', redisDriver({ ...commonOptions, base: 'queue' }))
  } catch (error) {
    console.warn('[storage] falha ao montar Redis, usando memória:', (error as Error)?.message)
  }
})
