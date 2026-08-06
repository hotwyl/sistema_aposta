<script setup lang="ts">
defineProps<{
  variant?: 'blue' | 'green' | 'yellow' | 'purple'
}>()
</script>

<template>
  <div
    :class="[
      'p-4 rounded-xl border text-sm',
      variant === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30 text-green-700 dark:text-green-300' :
      variant === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-300' :
      variant === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30 text-purple-700 dark:text-purple-300' :
      'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30 text-blue-700 dark:text-blue-300'
    ]"
  >
    <p>
      <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
      <strong>Dica:</strong>
      <slot />
    </p>
  </div>
</template>
