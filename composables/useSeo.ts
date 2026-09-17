/**
 * Composable para configurar SEO/SEM/GEO/AEO nas páginas de forma consistente.
 * Centraliza título, descrição, Open Graph, Twitter Card, canonical e
 * dados estruturados (Schema.org WebPage) — evitando duplicação entre páginas.
 */
interface SeoOptions {
  title: string
  description?: string
  /** Caminho relativo da página, ex: '/simulador' */
  path?: string
  /** Palavras-chave específicas da página */
  keywords?: string
  /** Tipo Open Graph (website, article...) */
  type?: 'website' | 'article'
}

export function useSeo(options: SeoOptions) {
  const { title, description, path, keywords, type = 'website' } = options

  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string) || 'http://localhost:3000'

  const fullTitle = `${title} - Sistema de Aposta`
  const desc =
    description ||
    'Sistema de Aposta - Análise e gestão inteligente de apostas em loterias brasileiras (Lotofácil e Lotomania).'
  const canonical = path ? `${siteUrl.replace(/\/+$/, '')}${path}` : siteUrl

  useSeoMeta({
    title: fullTitle,
    description: desc,
    keywords: keywords || 'loteria, lotofácil, lotomania, apostas, análise, estatística',
    // Open Graph
    ogTitle: fullTitle,
    ogDescription: desc,
    ogType: type,
    ogUrl: canonical,
    ogSiteName: 'Sistema de Aposta',
    ogLocale: 'pt_BR',
    // Twitter
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: desc,
  })

  // Dados estruturados JSON-LD (GEO/AEO): ajuda buscadores e assistentes de IA.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description: desc,
    url: canonical,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Sistema de Aposta',
      url: siteUrl,
    },
  }

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) }],
  })
}
