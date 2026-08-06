<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 9)}`
</script>

<template>
  <span class="tooltip-container">
    <button
      type="button"
      class="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 rounded-full"
      :aria-describedby="tooltipId"
      aria-label="Ajuda"
    >
      <i class="fas fa-question-circle text-xs" aria-hidden="true"></i>
    </button>
    <span :id="tooltipId" class="tooltip-text" role="tooltip">{{ props.text }}</span>
  </span>
</template>
