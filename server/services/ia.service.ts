/**
 * Serviço de geração de apostas via IA.
 * Utiliza exclusivamente OmniRoute como gateway de IA.
 * OmniRoute expõe uma API OpenAI-compatible em /v1/chat/completions.
 */

export interface IAConfig {
  omnirouterUrl: string
  omnirouterApiKey: string
  omnirouterModel: string
}

export class IAService {
  private cfg: IAConfig

  constructor(config: IAConfig) {
    this.cfg = config
  }

  isConfigured(): boolean {
    return !!(this.cfg.omnirouterUrl && this.cfg.omnirouterApiKey)
  }

  async gerarAposta(prompt: string): Promise<{ provider: string; resposta: string } | null> {
    if (!this.isConfigured()) return null

    try {
      const baseUrl = this.cfg.omnirouterUrl.replace(/\/$/, '')
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cfg.omnirouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.cfg.omnirouterModel,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise estatística de loterias brasileiras. Responda APENAS com JSON válido, sem markdown, sem explicações.',
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
        console.error(`[IA] OmniRoute respondeu ${res.status}: ${res.statusText}`)
        return null
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (!content) return null

      const model = data?.model || this.cfg.omnirouterModel
      return { provider: `OmniRoute (${model})`, resposta: content }
    } catch (error) {
      console.error('[IA] Erro ao comunicar com OmniRoute:', (error as Error)?.message || error)
      return null
    }
  }
}
