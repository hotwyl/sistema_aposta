<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'

useHead({ title: 'Números em Atraso - Sistema de Aposta' })

const loading = useLoadingStore()
const tipo = ref<'lotofacil' | 'lotomania'>('lotofacil')

const { data: response, refresh } = await useFetch('/api/analisador/atrasos', {
  query: { tipo },
})

const atrasos = computed(() => {
  const data = response.value?.data as Record<string, number> | undefined
  if (!data) return []
  return Object.entries(data)
    .map(([numero, atraso]) => ({ numero: Number(numero), atraso: Number(atraso) }))
    .sort((a, b) => b.atraso - a.atraso)
    .slice(0, 25)
})

watch(tipo, async () => {
  loading.show('Carregando atrasos...')
  await refresh()
  loading.hide()
})
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[
      { label: 'Analisador', to: '/analisador' },
      { label: 'Números em Atraso' }
    ]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 mb-6 gap-4">
      <div class="flex items-center space-x-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <i class="fas fa-clock text-yellow-600 dark:text-yellow-400 mr-2" aria-hidden="true"></i> Números em Atraso
        </h1>
        <TooltipHelp text="Números ordenados por quantidade de concursos sem serem sorteados." />
      </div>
      <div class="flex items-center space-x-2">
        <button
          :class="['px-3 py-1.5 text-sm rounded-lg transition', tipo === 'lotofacil' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
          @click="tipo = 'lotofacil'"
        >Lotofácil</button>
        <button
          :class="['px-3 py-1.5 text-sm rounded-lg transition', tipo === 'lotomania' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
          @click="tipo = 'lotomania'"
        >Lotomania</button>
        <NuxtLink to="/analisador" class="btn-secondary btn-sm">
          <i class="fas fa-arrow-left mr-1" aria-hidden="true"></i> Voltar
        </NuxtLink>
      </div>
    </div>

    <div class="card p-6 mb-6">
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Números ordenados por quantidade de concursos sem serem sorteados. Quanto maior o atraso, mais tempo o número está sem aparecer.
      </p>

      <div v-if="atrasos.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <div v-for="item in atrasos" :key="item.numero" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span class="w-9 h-9 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm font-bold rounded-full">
            {{ String(item.numero).padStart(2, '0') }}
          </span>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ item.atraso }} <span class="text-xs">conc.</span>
          </span>
        </div>
      </div>
      <p v-else class="text-gray-500 dark:text-gray-400 text-center py-8">
        Nenhum dado disponível. <NuxtLink to="/importador" class="text-brand-600 underline">Importe concursos</NuxtLink> primeiro.
      </p>
    </div>

    <TipCard variant="yellow">
      Números com grande atraso podem estar "devendo" uma aparição, mas lembre-se: cada sorteio é independente. Use essa informação como complemento, não como garantia.
    </TipCard>
  </div>
</template>
