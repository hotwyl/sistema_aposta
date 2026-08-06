import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    message: 'Processando...',
  }),
  actions: {
    show(message = 'Processando...') {
      this.isLoading = true
      this.message = message
    },
    hide() {
      this.isLoading = false
      this.message = 'Processando...'
    },
  },
})
