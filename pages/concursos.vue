<script setup lang="ts">
import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useHead({ title: 'Concursos - Sistema de Aposta' })

const loading = useLoadingStore()
const alert = useAlert()

const tipo = ref<string>('')

const { data: response, refresh, status } = await useFetch('/api/concursos', {
  query: { tipo },
})

const concursos = computed(() => response.value?.data || [])

async function excluir(id: string, numero: number) {
  const result = await alert.confirm('Excluir concurso?', `O concurso ${numero} será removido permanentemente.`)
  if (!result.isConfirmed) return

  loading.show('Excluindo...')
  try {
    await $fetch(`/api/concursos/${id}`, { method: 'DELETE' })
    await refresh()
    alert.success('Concurso excluído!')
  } catch {
    alert.error('Erro', 'Não foi possível excluir.')
  } finally {
    loading.hide()
  }
}

interface Concurso {
  id: string
  numeroConcurso: number
  tipoLoteria: string
  dataSorteio: string
  numerosSorteados: number[]
}

const columnHelper = createColumnHelper<Concurso>()

const columns = [
  columnHelper.accessor('numeroConcurso', {
    header: 'Concurso',
    cell: (info) => h('span', { class: 'font-medium text-gray-900 dark:text-white' }, info.getValue()),
  }),
  columnHelper.accessor('tipoLoteria', {
    header: 'Tipo',
    cell: (info) => {
      const val = info.getValue()
      const isLotofacil = val === 'lotofacil'
      return h('span', {
        class: `badge ${isLotofacil ? 'badge-success' : 'badge-purple'}`,
      }, isLotofacil ? 'Lotofácil' : 'Lotomania')
    },
  }),
  columnHelper.accessor('dataSorteio', {
    header: 'Data',
    cell: (info) => h('span', { class: 'text-gray-500 text-xs' },
      new Date(info.getValue()).toLocaleDateString('pt-BR')),
  }),
  columnHelper.accessor('numerosSorteados', {
    header: 'Números',
    enableSorting: false,
    cell: (info) => {
      const nums = info.getValue() as number[]
      const display = nums.slice(0, 8).map((n: number) => String(n).padStart(2, '0')).join(', ')
      return h('span', { class: 'font-mono text-xs bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg' },
        display + (nums.length > 8 ? '...' : ''))
    },
  }),
  columnHelper.display({
    id: 'acoes',
    header: 'Ações',
    cell: (info) => h('button', {
      class: 'p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
      title: 'Excluir',
      onClick: (e: Event) => {
        e.stopPropagation()
        excluir(info.row.original.id, info.row.original.numeroConcurso)
      },
    }, h('i', { class: 'fas fa-trash text-xs' })),
  }),
]
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Concursos' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 mb-6 gap-4">
      <div class="flex items-center space-x-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <i class="fas fa-trophy text-yellow-600 dark:text-yellow-400 mr-2" aria-hidden="true"></i> Concursos
        </h1>
        <TooltipHelp text="Gerencie os resultados oficiais dos concursos. Use o Importador para carregar vários de uma vez." />
      </div>
      <NuxtLink to="/importador" class="btn-primary btn-sm">
        <i class="fas fa-file-import mr-1.5" aria-hidden="true"></i> Importar Concursos
      </NuxtLink>
    </div>

    <!-- Filtros por tipo -->
    <div class="card p-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center space-x-2">
          <i class="fas fa-filter text-gray-400 text-sm" aria-hidden="true"></i>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-all', tipo === '' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300']" @click="tipo = ''">Todos</button>
          <button :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-all', tipo === 'lotofacil' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300']" @click="tipo = 'lotofacil'">Lotofácil</button>
          <button :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-all', tipo === 'lotomania' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300']" @click="tipo = 'lotomania'">Lotomania</button>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="card p-4">
      <DataTable
        :data="concursos"
        :columns="columns"
        :page-size="20"
        :loading="status === 'pending'"
        search-placeholder="Buscar por número, tipo ou data..."
        empty-message="Nenhum concurso cadastrado. Use o importador para carregar resultados."
        empty-icon="fa-trophy"
      />
    </div>

    <TipCard class="mt-6">
      Os concursos são a base para conferência de resultados e análises estatísticas. Mantenha a base atualizada importando os últimos resultados.
    </TipCard>
  </div>
</template>
