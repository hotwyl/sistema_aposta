<template>
  <div>
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:outline-none">
      Pular para o conteúdo principal
    </a>
    <NuxtLoadingIndicator color="#4f46e5" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
