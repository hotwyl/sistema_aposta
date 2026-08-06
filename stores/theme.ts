import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    darkMode: false,
  }),
  actions: {
    init() {
      if (import.meta.client) {
        this.darkMode = localStorage.getItem('darkMode') === 'true'
        this.apply()
      }
    },
    toggle() {
      this.darkMode = !this.darkMode
      if (import.meta.client) {
        localStorage.setItem('darkMode', String(this.darkMode))
      }
      this.apply()
    },
    apply() {
      if (import.meta.client) {
        document.documentElement.classList.toggle('dark', this.darkMode)
      }
    },
  },
})
