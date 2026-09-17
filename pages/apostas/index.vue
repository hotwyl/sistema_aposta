<script setup lang="ts">
import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useSeo({ title: 'Apostas', path: '/apostas', description: 'Gerencie suas apostas cadastradas da Lotofácil e Lotomania.' })

const loading = useLoadingStore()
const alert = useAlert()

const tipo = ref<string>('')

const { data: response, refresh, status } = await useFetch('/api/apostas', {
  query: { tipo },
})

const apostas = computed(() => response.value?.data || [])

async function toggleFavorita(id: string) {
  loading.show('Atualizando...')
  try {
    await $fetch(`/api/apostas/${id}`, { method: 'PATCH' })
    await refresh()
    alert.success('Favorita atualizada!')
  } catch {
    alert.error('Erro', 'Não foi possível atualizar.')
  } finally {
    loading.hide()
  }
}

async function excluirAposta(id: string) {
  const result = await alert.confirm('Excluir aposta?', 'Esta ação não pode ser desfeita.')
  if (!result.isConfirmed) return

  loading.show('Excluindo...')
  try {
    await $fetch(`/api/apostas/${id}`, { method: 'DELETE' })
    await refresh()
    alert.success('Aposta excluída!')
  } catch {
    alert.error('Erro', 'Não foi possível excluir.')
  } finally {
    loading.hide()
  }
}

interface Aposta {
  id: string
  tipoLoteria: string
  numeros: number[]
  quantidadeNumeros: number
  valorAposta: string
  isFavorita: boolean
  dataAposta: string | null
}

const columnHelper = createColumnHelper<Aposta>()

const columns = [
  columnHelper.accessor('tipoLoteria', {
    header: 'Tipo',
    cell: (info) => {
      const val = info.getValue()
      const isLotofacil = val === 'lotofacil'
      const fav = info.row.original.isFavorita
      const children = [
        h('span', { class: `badge ${isLotofacil ? 'badge-success' : 'badge-purple'}` },
          isLotofacil ? 'Lotofácil' : 'Lotomania'),
      ]
      if (fav) children.push(h('i', { class: 'fas fa-heart text-red-400 ml-1.5 text-xs' }))
      return h('div', { class: 'flex items-center' }, children)
    },
  }),
  columnHelper.accessor('numeros', {
    header: 'Números',
    enableSorting: false,
    cell: (info) => {
      const nums = info.getValue() as number[]
      const display = nums.slice(0, 8).map((n: number) => String(n).padStart(2, '0')).join(', ')
      return h('span', { class: 'font-mono text-xs bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg' },
        display + (nums.length > 8 ? '...' : ''))
    },
  }),
  columnHelper.accessor('valorAposta', {
    header: 'Valor',
    cell: (info) => h('span', { class: 'text-gray-600 dark:text-gray-400 font-medium' },
      `R$ ${Number(info.getValue()).toFixed(2).replace('.', ',')}`),
  }),
  columnHelper.accessor('dataAposta', {
    header: 'Data',
    cell: (info) => {
      const val = info.getValue()
      return h('span', { class: 'text-gray-400 text-xs' },
        val ? new Date(val).toLocaleDateString('pt-BR') : '-')
    },
  }),
  columnHelper.display({
    id: 'acoes',
    header: 'Ações',
    cell: (info) => {
      const row = info.row.original
      return h('div', { class: 'flex items-center justify-center space-x-1' }, [
        h(resolveComponent('NuxtLink'), {
          to: `/apostas/${row.id}`,
          class: 'p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors',
          title: 'Ver detalhes',
        }, () => h('i', { class: 'fas fa-eye text-xs' })),
        h(resolveComponent('NuxtLink'), {
          to: `/apostas/${row.id}/editar`,
          class: 'p-1.5 rounded-lg text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors',
          title: 'Editar',
        }, () => h('i', { class: 'fas fa-edit text-xs' })),
        h('button', {
          class: 'p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
          title: 'Favorita',
          onClick: (e: Event) => { e.stopPropagation(); toggleFavorita(row.id) },
        }, h('i', { class: `fas fa-heart text-xs ${row.isFavorita ? 'text-red-500' : 'text-red-400'}` })),
        h('button', {
          class: 'p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
          title: 'Excluir',
          onClick: (e: Event) => { e.stopPropagation(); excluirAposta(row.id) },
        }, h('i', { class: 'fas fa-trash text-xs' })),
      ])
    },
  }),
]
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Apostas' }]" />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 mb-6 gap-4">
      <div class="flex items-center space-x-2">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          <i class="fas fa-ticket-alt text-brand-600 dark:text-brand-400 mr-2"></i> Apostas
        </h1>
        <TooltipHelp text="Gerencie suas apostas. Você pode criar, editar, excluir e marcar como favoritas." />
      </div>
      <div class="flex items-center space-x-2">
        <NuxtLink to="/apostas/ranking" class="btn-secondary btn-sm">
          <i class="fas fa-ranking-star mr-1.5"></i> Ranking
        </NuxtLink>
        <NuxtLink to="/apostas/nova" class="btn-primary btn-sm">
          <i class="fas fa-plus mr-1.5"></i> Nova Aposta
        </NuxtLink>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card p-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center space-x-2">
          <i class="fas fa-filter text-gray-400 text-sm"></i>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por tipo:</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200', tipo === '' ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']" @click="tipo = ''">Todas</button>
          <button :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200', tipo === 'lotofacil' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']" @click="tipo = 'lotofacil'">
            <i class="fas fa-clover mr-1"></i> Lotofácil
          </button>
          <button :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200', tipo === 'lotomania' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600']" @click="tipo = 'lotomania'">
            <i class="fas fa-star mr-1"></i> Lotomania
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="card p-4">
      <DataTable
        :data="apostas"
        :columns="columns"
        :page-size="15"
        :loading="status === 'pending'"
        search-placeholder="Buscar por tipo, número ou valor..."
        empty-message="Nenhuma aposta registrada. Comece registrando sua primeira aposta."
        empty-icon="fa-ticket-alt"
      />
    </div>

    <TipCard class="mt-6">
      Use os filtros acima para visualizar apostas por tipo de loteria. Marque como favorita para encontrar rapidamente suas melhores combinações.
    </TipCard>
  </div>
</template>
