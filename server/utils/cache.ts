/**
 * Utilitário de cache baseado no storage 'cache' do Nitro (driver Redis).
 * Segue o padrão cache-aside: tenta ler do cache, senão executa a função,
 * grava e retorna. Falhas de cache NUNCA quebram a requisição (degradação
 * graciosa) — se o Redis estiver fora, a origem (banco) é usada normalmente.
 */
import { useStorage } from '#imports'

type CacheStorage = ReturnType<typeof useStorage>

function storage(): CacheStorage {
  return useStorage('cache')
}

interface CacheEntry<T> {
  v: T
  /** timestamp (ms) de expiração */
  exp: number
}

/**
 * Retorna o valor em cache ou executa `factory`, grava e retorna.
 * @param key chave lógica do cache
 * @param ttlSeconds tempo de vida em segundos
 * @param factory função que produz o valor quando não há cache
 */
export async function cached<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
  const store = storage()

  try {
    const hit = (await store.getItem(key)) as CacheEntry<T> | null
    if (hit && hit.exp > Date.now()) {
      return hit.v
    }
  } catch (error) {
    // Cache indisponível: segue para a origem.
    console.warn('[cache] leitura falhou, usando origem:', (error as Error)?.message)
  }

  const value = await factory()

  try {
    const entry: CacheEntry<T> = { v: value, exp: Date.now() + ttlSeconds * 1000 }
    await store.setItem(key, entry)
  } catch (error) {
    console.warn('[cache] gravação falhou:', (error as Error)?.message)
  }

  return value
}

/** Remove uma chave específica do cache. */
export async function invalidate(key: string): Promise<void> {
  try {
    await storage().removeItem(key)
  } catch (error) {
    console.warn('[cache] invalidação falhou:', (error as Error)?.message)
  }
}

/**
 * Invalida todas as chaves com um determinado prefixo.
 * Útil ao importar concursos (invalida estatísticas/análises daquele tipo).
 */
export async function invalidatePrefix(prefix: string): Promise<void> {
  try {
    const store = storage()
    const keys = await store.getKeys(prefix)
    await Promise.all(keys.map((k) => store.removeItem(k)))
  } catch (error) {
    console.warn('[cache] invalidação por prefixo falhou:', (error as Error)?.message)
  }
}
