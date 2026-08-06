/**
 * Composable para configurar SEO nas páginas de forma consistente.
 * Evita duplicação de metadados entre as páginas.
 */
export function useSeo(options: {
  title: string
  description?: string
  path?: string
}) {
  const { title, description, path } = options
  const fullTitle = `${title} - Sistema de Aposta`
  const desc = description || 'Sistema de Aposta - Análise e gestão inteligente de apostas em loterias brasileiras.'

  useHead({
    title: fullTitle,
    meta: [
      { name: 'description', content: desc },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: desc },
      ...(path ? [{ property: 'og:url', content: path }] : []),
    ],
  })
}
