<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main id="main-content" class="flex-1" role="main">
      <slot />
    </main>
    <AppFooter />
    <LoadingOverlay />
    <LgpdBanner />
  </div>
</template>
