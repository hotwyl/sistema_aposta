/**
 * Serviço de geração de apostas via IA.
 * Utiliza exclusivamente o 9Router como gateway de IA.
 * O 9Router expõe uma API OpenAI-compatible em /v1/chat/completions.
 * Docs: https://github.com/decolua/9router
 */
import { useRuntimeConfig } from '#imports'

export interface IAConfig {
  /** URL base do gateway 9Router (ex: http://9router:20128) */
  gatewayUrl: string
  /** Chave de API gerada no dashboard do 9Router */
  apiKey: string
  /** Modelo a ser usado (ex: auto/best, openai/gpt-4o-mini) */
  model: string
}

export interface IAResposta {
  provider: string
  resposta: string
}

export class IAService {
  private readonly cfg: IAConfig

  constructor(config: IAConfig) {
    this.cfg = config
  }

  /** Indica se o gateway está minimamente configurado (URL + API key). */
  isConfigured(): boolean {
    return Boolean(this.cfg.gatewayUrl && this.cfg.apiKey)
  }

  /**
   * Envia um prompt ao 9Router e retorna o conteúdo textual da resposta.
   * Retorna null em qualquer falha (nunca lança), para o handler decidir o fluxo.
   */
  async gerarAposta(prompt: string): Promise<IAResposta | null> {
    if (!this.isConfigured()) return null

    const baseUrl = this.cfg.gatewayUrl.replace(/\/+$/, '')

    try {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cfg.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.cfg.model,
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em análise estatística de loterias brasileiras. Responda APENAS com JSON válido, sem markdown, sem explicações.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
        }),
        signal: AbortSignal.timeout(90_000),
      })

      if (!res.ok) {
        console.error(`[IA] 9Router respondeu ${res.status}: ${res.statusText}`)
        return null
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (!content) return null

      const model = data?.model || this.cfg.model
      return { provider: `9Router (${model})`, resposta: content }
    } catch (error) {
      console.error('[IA] Erro ao comunicar com 9Router:', (error as Error)?.message || error)
      return null
    }
  }
}

/**
 * Factory que constrói o IAService a partir do runtimeConfig do Nuxt.
 * Centraliza a leitura de configuração em um único lugar (evita repetir
 * a leitura de env em cada handler e mantém defaults consistentes).
 */
export function createIAService(): IAService {
  const cfg = useRuntimeConfig()
  return new IAService({
    gatewayUrl: cfg.nineRouterUrl,
    apiKey: cfg.nineRouterApiKey,
    model: cfg.nineRouterModel,
  })
}
