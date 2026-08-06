<script setup lang="ts">
import type { BreadcrumbItem } from '~/types'

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 lg:px-8 py-2.5" aria-label="Navegação estrutural">
    <div class="max-w-7xl mx-auto">
      <ol class="flex items-center space-x-2 text-sm">
        <li>
          <NuxtLink to="/" class="text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <i class="fas fa-home"></i>
          </NuxtLink>
        </li>
        <li v-for="(item, index) in items" :key="index" class="flex items-center">
          <i class="fas fa-chevron-right text-gray-300 dark:text-gray-600 mx-2 text-[10px]"></i>
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <i v-if="item.icon" :class="['fas', item.icon, 'mr-1 text-xs']"></i>
            {{ item.label }}
          </NuxtLink>
          <span v-else class="text-gray-600 dark:text-gray-400 font-medium">
            <i v-if="item.icon" :class="['fas', item.icon, 'mr-1 text-xs']"></i>
            {{ item.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>
