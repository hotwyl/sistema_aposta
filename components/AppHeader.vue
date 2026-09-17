<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const mobileMenuOpen = ref(false)
const route = useRoute()

const navLinks = [
  { to: '/', icon: 'fa-home', label: 'Início' },
  { to: '/apostas', icon: 'fa-ticket-alt', label: 'Apostas' },
  { to: '/concursos', icon: 'fa-trophy', label: 'Concursos' },
  { to: '/simulador', icon: 'fa-dice', label: 'Simulador' },
  { to: '/analisador', icon: 'fa-chart-pie', label: 'Analisador' },
  { to: '/importador', icon: 'fa-file-import', label: 'Importador' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <header class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-40">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center space-x-2.5 group" aria-label="Página inicial - Sistema de Aposta">
            <div class="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <i class="fas fa-clover text-white text-sm" aria-hidden="true"></i>
            </div>
            <span class="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline tracking-tight">
              Sistema de Aposta
            </span>
          </NuxtLink>

          <!-- Desktop Nav -->
          <div class="hidden lg:flex lg:items-center lg:ml-8 space-x-1" role="menubar">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              role="menuitem"
              :aria-current="isActive(link.to) ? 'page' : undefined"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive(link.to)
                  ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
            >
              <i :class="['fas', link.icon, 'mr-1.5 text-xs']" aria-hidden="true"></i>{{ link.label }}
            </NuxtLink>
          </div>
        </div>

        <!-- Right Side -->
        <div class="flex items-center space-x-2">
          <!-- Dark Mode Toggle -->
          <button
            class="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            :title="themeStore.darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'"
            :aria-label="themeStore.darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'"
            @click="themeStore.toggle()"
          >
            <i v-if="!themeStore.darkMode" class="fas fa-moon text-sm" aria-hidden="true"></i>
            <i v-else class="fas fa-sun text-yellow-400 text-sm" aria-hidden="true"></i>
          </button>

          <!-- Sobre (desktop only) -->
          <NuxtLink
            to="/sobre"
            class="hidden md:inline-flex px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <i class="fas fa-info-circle mr-1.5 text-xs" aria-hidden="true"></i>Sobre
          </NuxtLink>

          <!-- Mobile Menu Button -->
          <button
            class="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Abrir menu de navegação"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <i v-if="!mobileMenuOpen" class="fas fa-bars" aria-hidden="true"></i>
            <i v-else class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-show="mobileMenuOpen"
        id="mobile-menu"
        class="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800"
        role="menu"
      >
        <div class="pt-3 pb-4 space-y-1 px-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            role="menuitem"
            :aria-current="isActive(link.to) ? 'page' : undefined"
            :class="[
              'flex items-center py-2.5 px-3 text-sm rounded-lg transition-colors',
              isActive(link.to)
                ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            ]"
          >
            <i :class="['fas', link.icon, 'w-5 mr-3 text-center text-xs']" aria-hidden="true"></i>{{ link.label }}
          </NuxtLink>

          <div class="border-t border-gray-200/50 dark:border-gray-700/50 my-2 pt-2">
            <NuxtLink to="/sobre" role="menuitem" class="flex items-center py-2.5 px-3 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <i class="fas fa-info-circle w-5 mr-3 text-center text-xs" aria-hidden="true"></i>Sobre
            </NuxtLink>
            <NuxtLink to="/termos" role="menuitem" class="flex items-center py-2.5 px-3 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <i class="fas fa-file-contract w-5 mr-3 text-center text-xs" aria-hidden="true"></i>Termos de Uso
            </NuxtLink>
            <NuxtLink to="/privacidade" role="menuitem" class="flex items-center py-2.5 px-3 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <i class="fas fa-shield-alt w-5 mr-3 text-center text-xs" aria-hidden="true"></i>Privacidade
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
