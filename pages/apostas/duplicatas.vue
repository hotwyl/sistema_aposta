<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useHead({ title: 'Duplicatas - Sistema de Aposta' })

const loading = useLoadingStore()
const alert = useAlert()

const tipo = ref<'lotofacil' | 'lotomania'>('lotofacil')
const resultado = ref<{ totalApostas: number; totalDuplicatas: number; grupos: Array<{ numeros: number[]; quantidade: number }> } | null>(null)

async function verificar() {
  loading.show('Verificando duplicatas...')
  try {
    const res = await $fetch('/api/apostas/duplicatas', { query: { tipo: tipo.value } })
    resultado.value = (res as { data: typeof resultado.value }).data
  } catch {
    alert.error('Erro', 'Falha ao verificar duplicatas.')
  } finally {
    loading.hide()
  }
}

async function remover() {
  if (!resultado.value || resultado.value.totalDuplicatas === 0) return

  const confirm = await alert.confirm(
    'Remover duplicatas?',
    `${resultado.value.totalDuplicatas} apostas duplicadas serão removidas. A mais antiga de cada grupo será mantida.`
  )
  if (!confirm.isConfirmed) return

  loading.show('Removendo duplicatas...')
  try {
    const res = await $fetch('/api/apostas/duplicatas', {
      method: 'DELETE',
      query: { tipo: tipo.value },
    })
    const data = (res as { data: { removidas: number }; message: string })
    alert.success('Concluído!', data.message)
    resultado.value = null
  } catch {
    alert.error('Erro', 'Falha ao remover duplicatas.')
  } finally {
    loading.hide()
  }
}

watch(tipo, () => { resultado.value = null })
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[
      { label: 'Apostas', to: '/apostas' },
      { label: 'Duplicatas' }
    ]" />

    <div class="flex items-center justify-between mt-6 mb-6">
      <div class="flex items-center space-x-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <i class="fas fa-copy text-orange-600 dark:text-orange-400 mr-2" aria-hidden="true"></i> Duplicatas
        </h1>
        <TooltipHelp text="Identifique e remova apostas com números idênticos. A mais antiga é preservada." />
      </div>
    </div>

    <div class="card p-6 mb-6">
      <form class="flex flex-col sm:flex-row items-end gap-4" autocomplete="off" @submit.prevent="verificar">
        <div class="flex-1">
          <label class="form-label">Tipo de Loteria</label>
          <select v-model="tipo" class="form-input" autocomplete="off">
            <option value="lotofacil">Lotofácil</option>
            <option value="lotomania">Lotomania</option>
          </select>
        </div>
        <button type="submit" class="btn-primary">
          <i class="fas fa-search mr-2" aria-hidden="true"></i> Verificar
        </button>
      </form>
    </div>

    <!-- Resultado -->
    <div v-if="resultado" class="card p-6 animate-slide-up">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ resultado.totalApostas }}</p>
          <p class="text-xs text-gray-500">Total de Apostas</p>
        </div>
        <div :class="['text-center p-4 rounded-xl', resultado.totalDuplicatas > 0 ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800']">
          <p :class="['text-2xl font-bold', resultado.totalDuplicatas > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300']">
            {{ resultado.totalDuplicatas }}
          </p>
          <p class="text-xs text-gray-500">Duplicatas</p>
        </div>
      </div>

      <div v-if="resultado.totalDuplicatas > 0">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Grupos Duplicados ({{ resultado.grupos.length }})
        </h3>
        <div class="space-y-2 max-h-60 overflow-y-auto mb-4">
          <div v-for="(grupo, i) in resultado.grupos.slice(0, 20)" :key="i" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
            <span class="font-mono text-xs">
              {{ (grupo.numeros as number[]).slice(0, 8).map(n => String(n).padStart(2, '0')).join(', ') }}{{ (grupo.numeros as number[]).length > 8 ? '...' : '' }}
            </span>
            <span class="badge badge-warning">{{ grupo.quantidade }}x</span>
          </div>
        </div>
        <button class="w-full btn-danger justify-center" @click="remover">
          <i class="fas fa-trash mr-2" aria-hidden="true"></i> Remover {{ resultado.totalDuplicatas }} Duplicatas
        </button>
      </div>
      <div v-else class="text-center py-4">
        <i class="fas fa-check-circle text-green-500 text-2xl mb-2" aria-hidden="true"></i>
        <p class="text-sm text-gray-600 dark:text-gray-400">Nenhuma aposta duplicada encontrada!</p>
      </div>
    </div>

    <TipCard variant="yellow" class="mt-6">
      A verificação compara os números de cada aposta (ignorando a ordem). A mais antiga de cada grupo é sempre preservada.
    </TipCard>
  </div>
</template>
