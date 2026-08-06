<script setup lang="ts">
const showBanner = ref(false)

onMounted(() => {
  if (import.meta.client) {
    const consent = localStorage.getItem('lgpd_consent')
    showBanner.value = consent !== 'accepted'
  }
})

function accept() {
  if (import.meta.client) {
    localStorage.setItem('lgpd_consent', 'accepted')
    localStorage.setItem('lgpd_consent_date', new Date().toISOString())
  }
  showBanner.value = false
}

function reject() {
  if (import.meta.client) {
    localStorage.setItem('lgpd_consent', 'rejected')
    localStorage.setItem('lgpd_consent_date', new Date().toISOString())
  }
  showBanner.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="showBanner"
        class="fixed bottom-0 inset-x-0 z-[9998] p-4 sm:p-6"
        role="dialog"
        aria-label="Aviso de privacidade LGPD"
        aria-describedby="lgpd-description"
      >
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                <i class="fas fa-shield-alt text-brand-600 dark:text-brand-400" aria-hidden="true"></i>
              </div>
            </div>
            <div class="flex-1" id="lgpd-description">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Aviso de Privacidade
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Este sistema utiliza apenas armazenamento local (localStorage) para salvar sua preferência de tema.
                Não utilizamos cookies de rastreamento. Os dados de apostas inseridos são armazenados em nosso servidor
                para funcionalidades do sistema. Ao continuar, você concorda com nossa
                <NuxtLink to="/privacidade" class="text-brand-600 dark:text-brand-400 underline hover:text-brand-700">
                  Política de Privacidade
                </NuxtLink> e
                <NuxtLink to="/termos" class="text-brand-600 dark:text-brand-400 underline hover:text-brand-700">
                  Termos de Uso
                </NuxtLink>.
              </p>
            </div>
            <div class="flex gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                class="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                @click="reject"
              >
                Rejeitar
              </button>
              <button
                class="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                @click="accept"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
