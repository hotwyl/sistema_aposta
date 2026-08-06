import { useLoadingStore } from '~/stores/loading'

/**
 * Plugin client-side que exibe o loading overlay durante navegações de página.
 * Complementa o NuxtLoadingIndicator (barra no topo) com o overlay com fundo ofuscado.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const loading = useLoadingStore()
  let navigationTimer: ReturnType<typeof setTimeout> | null = null

  nuxtApp.hook('page:start', () => {
    // Delay de 300ms para não mostrar em navegações muito rápidas
    navigationTimer = setTimeout(() => {
      loading.show('Carregando página...')
    }, 300)
  })

  nuxtApp.hook('page:finish', () => {
    if (navigationTimer) {
      clearTimeout(navigationTimer)
      navigationTimer = null
    }
    loading.hide()
  })

  nuxtApp.hook('app:error', () => {
    if (navigationTimer) {
      clearTimeout(navigationTimer)
      navigationTimer = null
    }
    loading.hide()
  })
})
