<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'

const loadingStore = useLoadingStore()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loadingStore.isLoading"
        class="loading-overlay"
        role="alert"
        aria-live="assertive"
        aria-busy="true"
        aria-label="Carregando conteúdo"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4 max-w-sm mx-4">
          <div class="w-12 h-12 border-4 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin" aria-hidden="true"></div>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            {{ loadingStore.message }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
