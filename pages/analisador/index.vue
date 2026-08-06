<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'

useHead({ title: 'Analisador Estatístico - Sistema de Aposta' })

const loading = useLoadingStore()
const tipo = ref<'lotofacil' | 'lotomania'>('lotofacil')

// Stats dashboard
const { data: statsResponse } = await useFetch('/api/estatisticas')
const stats = computed(() => (statsResponse.value as any)?.data)

// Fetch data
const { data: response, status, refresh } = await useFetch(() => `/api/analisador/completo?tipo=${tipo.value}`)

const dados = computed(() => (response.value as any)?.data || null)
const maisSorteados = computed(() => dados.value?.maisSorteados || [])
const maisAtrasados = computed(() => dados.value?.maisAtrasados || [])
const parImpar = computed(() => dados.value?.parImpar || [])
const distribuicaoRepeticoes = computed(() => dados.value?.distribuicaoRepeticoes || [])

// Pagination
const pageSorteados = ref(1)
const pageAtrasados = ref(1)
const perPage = 10

// Sorted data
const sortSorteados = ref<'freq' | 'numero'>('freq')
const sortSorteadosDir = ref<'asc' | 'desc'>('desc')
const sortAtrasados = ref<'atraso' | 'numero'>('atraso')
const sortAtrasadosDir = ref<'asc' | 'desc'>('desc')

const sortedMaisSorteados = computed(() => {
  const items = [...maisSorteados.value]
  if (sortSorteados.value === 'freq') {
    items.sort((a: any, b: any) => sortSorteadosDir.value === 'desc' ? b.frequencia - a.frequencia : a.frequencia - b.frequencia)
  } else {
    items.sort((a: any, b: any) => sortSorteadosDir.value === 'desc' ? b.numero - a.numero : a.numero - b.numero)
  }
  return items
})

const paginatedSorteados = computed(() => {
  const start = (pageSorteados.value - 1) * perPage
  return sortedMaisSorteados.value.slice(start, start + perPage)
})

const totalPagesSorteados = computed(() => Math.ceil(maisSorteados.value.length / perPage))

const sortedMaisAtrasados = computed(() => {
  const items = [...maisAtrasados.value]
  if (sortAtrasados.value === 'atraso') {
    items.sort((a: any, b: any) => sortAtrasadosDir.value === 'desc' ? b.atraso - a.atraso : a.atraso - b.atraso)
  } else {
    items.sort((a: any, b: any) => sortAtrasadosDir.value === 'desc' ? b.numero - a.numero : a.numero - b.numero)
  }
  return items
})

const paginatedAtrasados = computed(() => {
  const start = (pageAtrasados.value - 1) * perPage
  return sortedMaisAtrasados.value.slice(start, start + perPage)
})

const totalPagesAtrasados = computed(() => Math.ceil(maisAtrasados.value.length / perPage))

function toggleSortSorteados(col: 'freq' | 'numero') {
  if (sortSorteados.value === col) {
    sortSorteadosDir.value = sortSorteadosDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortSorteados.value = col
    sortSorteadosDir.value = 'desc'
  }
  pageSorteados.value = 1
}

function toggleSortAtrasados(col: 'atraso' | 'numero') {
  if (sortAtrasados.value === col) {
    sortAtrasadosDir.value = sortAtrasadosDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortAtrasados.value = col
    sortAtrasadosDir.value = 'desc'
  }
  pageAtrasados.value = 1
}

function getSortIcon(active: boolean, dir: 'asc' | 'desc'): string {
  if (!active) return 'fas fa-sort text-gray-300'
  return dir === 'desc' ? 'fas fa-sort-down text-brand-600' : 'fas fa-sort-up text-brand-600'
}

async function changeTipo(newTipo: 'lotofacil' | 'lotomania') {
  tipo.value = newTipo
  pageSorteados.value = 1
  pageAtrasados.value = 1
  iaAnalise.value = null
  loading.show('Carregando...')
  await refresh()
  loading.hide()
}

// IA Analysis
const iaLoading = ref(false)
const iaAnalise = ref<any>(null)

async function carregarAnaliseIA() {
  iaLoading.value = true
  try {
    const res = await $fetch(`/api/estatisticas/analise-ia?tipo=${tipo.value}`)
    iaAnalise.value = (res as any).data
  } catch {
    iaAnalise.value = { disponivel: false, mensagem: 'Erro ao carregar análise.' }
  } finally {
    iaLoading.value = false
  }
}

// Conferência de Resultados
const confNumeros = ref('')
const confNumeroConcurso = ref<number | null>(null)
const confApostaSelecionada = ref('')
const confResultado = ref<any>(null)
const confError = ref('')

const { data: apostasResponse } = await useFetch('/api/apostas', { query: { tipo } })
const apostasDisponiveis = computed(() => (apostasResponse.value as any)?.data || [])

watch(confApostaSelecionada, (id) => {
  if (!id) return
  const aposta = apostasDisponiveis.value.find((a: any) => a.id === id)
  if (aposta) {
    const nums = (aposta.numeros as number[]).sort((a: number, b: number) => a - b)
    confNumeros.value = nums.map((n: number) => String(n).padStart(2, '0')).join(', ')
  }
})

watch(tipo, () => { confApostaSelecionada.value = ''; confResultado.value = null; confError.value = '' })

async function conferir() {
  if (!confNumeros.value.trim()) {
    const { useAlert } = await import('~/composables/useAlert')
    useAlert().warning('Atenção', 'Informe os números para conferir.')
    return
  }
  loading.show('Conferindo números...')
  confError.value = ''
  confResultado.value = null
  try {
    const res = await $fetch('/api/conferencia/conferir', {
      method: 'POST',
      body: { tipoLoteria: tipo.value, numeros: confNumeros.value, numeroConcurso: confNumeroConcurso.value || null },
    })
    const data = (res as any).data
    if (data?.error) { confError.value = data.error }
    else { confResultado.value = data }
  } catch {
    confError.value = 'Falha ao conferir números.'
  } finally {
    loading.hide()
  }
}
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <AppBreadcrumb :items="[{ label: 'Analisador' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <i class="fas fa-chart-pie text-blue-600 mr-2"></i> Analisador
      </h1>
      <div class="flex items-center space-x-2">
        <NuxtLink to="/analisador/atrasos" class="px-3 py-1.5 text-sm rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 transition">
          <i class="fas fa-clock mr-1"></i> Atrasos
        </NuxtLink>
        <button
          :class="['px-3 py-1.5 text-sm rounded-lg transition font-medium', tipo === 'lotofacil' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
          @click="changeTipo('lotofacil')"
        >Lotofácil</button>
        <button
          :class="['px-3 py-1.5 text-sm rounded-lg transition font-medium', tipo === 'lotomania' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
          @click="changeTipo('lotomania')"
        >Lotomania</button>
      </div>
    </div>

    <!-- Painel de Estatísticas -->
    <div v-if="stats" class="mb-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ stats.totalApostas }}</p>
          <p class="text-xs text-gray-500 mt-1">Apostas</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.totalConcursos }}</p>
          <p class="text-xs text-gray-500 mt-1">Concursos</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.favoritas }}</p>
          <p class="text-xs text-gray-500 mt-1">Favoritas</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.melhorAcertoGeral }}</p>
          <p class="text-xs text-gray-500 mt-1">Melhor Acerto</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="card p-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500">Lotofácil</span>
            <span class="badge badge-success text-xs">{{ stats.apostasLotofacil }} apostas • {{ stats.concursosLotofacil }} conc.</span>
          </div>
        </div>
        <div class="card p-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500">Lotomania</span>
            <span class="badge badge-purple text-xs">{{ stats.apostasLotomania }} apostas • {{ stats.concursosLotomania }} conc.</span>
          </div>
        </div>
        <div class="card p-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500">Taxa Premiação</span>
            <span class="text-xs font-bold text-green-600">{{ stats.taxaPremiacao }}% ({{ stats.totalPremiacoes }}x)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="card p-12 text-center">
      <i class="fas fa-spinner fa-spin text-2xl text-brand-500 mb-3"></i>
      <p class="text-gray-500">Calculando estatísticas...</p>
    </div>

    <!-- Sem dados -->
    <div v-else-if="dados?.mensagem" class="card p-12 text-center">
      <i class="fas fa-info-circle text-3xl text-blue-400 mb-3"></i>
      <p class="text-gray-600 dark:text-gray-400">{{ dados.mensagem }}</p>
      <NuxtLink to="/importador" class="btn-primary btn-sm mt-4"><i class="fas fa-file-import mr-1"></i> Importar Concursos</NuxtLink>
    </div>

    <template v-else-if="dados">
      <!-- Resumo -->
      <div class="card p-4 mb-6 border-l-4 border-blue-500">
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          <i class="fas fa-database text-blue-500 mr-1"></i>
          {{ dados.totalConcursos }} concursos analisados — {{ tipo === 'lotofacil' ? 'Lotofácil' : 'Lotomania' }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Ranking Mais Sorteados -->
        <div class="card">
          <div class="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-fire text-orange-500 mr-2"></i> Mais Sorteados
            </h2>
            <p class="text-xs text-gray-500 mt-1">Números que mais apareceram em todos os sorteios.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase w-10">#</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-brand-600" @click="toggleSortSorteados('numero')">
                    Número <i :class="getSortIcon(sortSorteados === 'numero', sortSorteadosDir)" class="ml-1"></i>
                  </th>
                  <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-brand-600" @click="toggleSortSorteados('freq')">
                    Frequência <i :class="getSortIcon(sortSorteados === 'freq', sortSorteadosDir)" class="ml-1"></i>
                  </th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">%</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                <tr v-for="(item, idx) in paginatedSorteados" :key="item.numero" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td class="px-3 py-2 text-center text-xs text-gray-400">{{ (pageSorteados - 1) * perPage + idx + 1 }}</td>
                  <td class="px-3 py-2">
                    <span class="w-8 h-8 inline-flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded-full">
                      {{ String(item.numero).padStart(2, '0') }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-center font-medium text-gray-700 dark:text-gray-300">{{ item.frequencia }}x</td>
                  <td class="px-3 py-2 hidden sm:table-cell">
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div class="bg-orange-500 h-1.5 rounded-full" :style="{ width: item.percentual + '%' }"></div>
                      </div>
                      <span class="text-xs text-gray-500">{{ item.percentual }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="totalPagesSorteados > 1" class="p-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <span class="text-xs text-gray-500">Pág {{ pageSorteados }}/{{ totalPagesSorteados }}</span>
            <div class="flex space-x-1">
              <button :disabled="pageSorteados <= 1" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-40" @click="pageSorteados--">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button :disabled="pageSorteados >= totalPagesSorteados" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-40" @click="pageSorteados++">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Ranking Mais Atrasados -->
        <div class="card">
          <div class="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-clock text-red-500 mr-2"></i> Mais Atrasados
            </h2>
            <p class="text-xs text-gray-500 mt-1">Números com mais concursos sem aparecer.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase w-10">#</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-brand-600" @click="toggleSortAtrasados('numero')">
                    Número <i :class="getSortIcon(sortAtrasados === 'numero', sortAtrasadosDir)" class="ml-1"></i>
                  </th>
                  <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-brand-600" @click="toggleSortAtrasados('atraso')">
                    Atraso <i :class="getSortIcon(sortAtrasados === 'atraso', sortAtrasadosDir)" class="ml-1"></i>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                <tr v-for="(item, idx) in paginatedAtrasados" :key="item.numero" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td class="px-3 py-2 text-center text-xs text-gray-400">{{ (pageAtrasados - 1) * perPage + idx + 1 }}</td>
                  <td class="px-3 py-2">
                    <span class="w-8 h-8 inline-flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">
                      {{ String(item.numero).padStart(2, '0') }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-center">
                    <span :class="['font-medium', item.atraso > 10 ? 'text-red-600 dark:text-red-400' : item.atraso > 5 ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-400']">
                      {{ item.atraso }} conc.
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div v-if="totalPagesAtrasados > 1" class="p-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
            <span class="text-xs text-gray-500">Pág {{ pageAtrasados }}/{{ totalPagesAtrasados }}</span>
            <div class="flex space-x-1">
              <button :disabled="pageAtrasados <= 1" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-40" @click="pageAtrasados--">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button :disabled="pageAtrasados >= totalPagesAtrasados" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-40" @click="pageAtrasados++">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribuição Par/Ímpar -->
      <div class="card mb-6">
        <div class="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">
            <i class="fas fa-balance-scale text-indigo-500 mr-2"></i> Distribuição Par/Ímpar
          </h2>
          <p class="text-xs text-gray-500 mt-1">Porcentagem de cada combinação de pares e ímpares em todos os sorteios.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Combinação</th>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Pares</th>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Ímpares</th>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Ocorrências</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Porcentagem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr v-for="item in parImpar" :key="item.combinacao" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                <td class="px-3 py-2 font-medium text-gray-900 dark:text-white">{{ item.combinacao }}</td>
                <td class="px-3 py-2 text-center text-blue-600 font-medium">{{ item.pares }}</td>
                <td class="px-3 py-2 text-center text-purple-600 font-medium">{{ item.impares }}</td>
                <td class="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{{ item.ocorrencias }}</td>
                <td class="px-3 py-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div class="bg-indigo-500 h-2 rounded-full" :style="{ width: Math.min(item.percentual * 2.5, 100) + '%' }"></div>
                    </div>
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.percentual }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Repetições entre concursos -->
      <div class="card">
        <div class="p-4 border-b border-gray-100 dark:border-gray-700/50">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">
            <i class="fas fa-redo text-teal-500 mr-2"></i> Repetições entre Concursos Consecutivos
          </h2>
          <p class="text-xs text-gray-500 mt-1">Porcentagem de concursos que repetiram X números do concurso anterior.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Nº Repetidos</th>
                <th class="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Ocorrências</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Porcentagem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr v-for="item in distribuicaoRepeticoes" :key="item.repeticoes" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                <td class="px-3 py-2 text-center">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold">
                    {{ String(item.repeticoes).padStart(2, '0') }}
                  </span>
                </td>
                <td class="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{{ item.ocorrencias }}</td>
                <td class="px-3 py-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div class="bg-teal-500 h-2.5 rounded-full" :style="{ width: Math.min(item.percentual * 2.5, 100) + '%' }"></div>
                    </div>
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.percentual }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Análise com IA -->
    <div class="card p-6 mt-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
            <i class="fas fa-robot text-purple-500 mr-1"></i> Análise com Inteligência Artificial
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Insights e recomendações geradas por IA com base nos dados históricos</p>
        </div>
        <button class="btn-primary btn-sm" :disabled="iaLoading" @click="carregarAnaliseIA">
          <i :class="['fas mr-1', iaLoading ? 'fa-spinner fa-spin' : 'fa-brain']"></i>
          {{ iaLoading ? 'Analisando...' : 'Gerar Análise' }}
        </button>
      </div>

      <div v-if="iaAnalise">
        <template v-if="iaAnalise.disponivel">
          <!-- Resumo -->
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 mb-4">
            <p class="text-sm text-purple-800 dark:text-purple-200">
              <i class="fas fa-quote-left text-purple-400 mr-1"></i> {{ iaAnalise.analise?.resumo }}
            </p>
            <p class="text-xs text-purple-500 mt-2"><i class="fas fa-robot mr-1"></i> {{ iaAnalise.provider }} • {{ iaAnalise.totalConcursos }} concursos</p>
          </div>

          <!-- Dicas -->
          <div v-if="iaAnalise.analise?.dicas?.length" class="mb-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2"><i class="fas fa-lightbulb text-yellow-500 mr-1"></i> Dicas da IA</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="(dica, i) in iaAnalise.analise.dicas" :key="i" class="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <i class="fas fa-check-circle text-green-500 text-xs mt-0.5 flex-shrink-0"></i>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ dica }}</p>
              </div>
            </div>
          </div>

          <!-- Números -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="iaAnalise.analise?.numerosRecomendados?.length">
              <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">
                <i class="fas fa-thumbs-up text-green-500 mr-1"></i> Números Recomendados
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="n in iaAnalise.analise.numerosRecomendados" :key="n" class="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">{{ n }}</span>
              </div>
            </div>
            <div v-if="iaAnalise.analise?.numerosEvitar?.length">
              <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">
                <i class="fas fa-thumbs-down text-red-500 mr-1"></i> Números para Evitar
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="n in iaAnalise.analise.numerosEvitar" :key="n" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">{{ n }}</span>
              </div>
            </div>
          </div>

          <!-- Tendência -->
          <div v-if="iaAnalise.analise?.tendencia" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <span class="text-xs text-gray-500">Tendência geral:</span>
            <span :class="['ml-1 text-sm font-bold', iaAnalise.analise.tendencia === 'alta' ? 'text-green-600' : iaAnalise.analise.tendencia === 'estável' ? 'text-blue-600' : 'text-yellow-600']">
              {{ iaAnalise.analise.tendencia === 'alta' ? '📈 Alta' : iaAnalise.analise.tendencia === 'estável' ? '➡️ Estável' : '❓ Incerta' }}
            </span>
          </div>
        </template>
        <p v-else class="text-sm text-gray-500 text-center py-6">{{ iaAnalise.mensagem }}</p>
      </div>
      <div v-else class="text-center py-6">
        <i class="fas fa-brain text-3xl text-gray-300 dark:text-gray-600 mb-2"></i>
        <p class="text-xs text-gray-400">Clique em "Gerar Análise" para obter insights da IA baseados nos dados do {{ tipo === 'lotofacil' ? 'Lotofácil' : 'Lotomania' }}.</p>
      </div>
    </div>

    <!-- Conferir Resultados -->
    <div class="card p-6 mt-6">
      <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
        <i class="fas fa-check-double text-green-600 mr-2"></i> Conferir Resultados
      </h2>
      <form class="space-y-4" autocomplete="off" @submit.prevent="conferir">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Nº Concurso <span class="text-gray-400">(opcional - usa último)</span></label>
            <input v-model.number="confNumeroConcurso" type="number" placeholder="Último" class="form-input" autocomplete="off">
          </div>
          <div>
            <label class="form-label"><i class="fas fa-bookmark text-brand-500 mr-1"></i> Aposta salva</label>
            <select v-model="confApostaSelecionada" class="form-input" autocomplete="off">
              <option value="">Digitar manualmente</option>
              <option v-for="ap in apostasDisponiveis" :key="ap.id" :value="ap.id">
                {{ (ap.numeros as number[]).slice(0, 5).map((n: number) => String(n).padStart(2, '0')).join(', ') }}... ({{ (ap.numeros as number[]).length }} nº) {{ ap.isFavorita ? '⭐' : '' }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Seus Números</label>
          <textarea v-model="confNumeros" rows="2" class="form-input" placeholder="Ex: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15" autocomplete="off"></textarea>
          <p class="text-xs text-gray-500 mt-1">Separe por vírgula, espaço ou ponto-e-vírgula.</p>
        </div>
        <button type="submit" class="btn-primary btn-sm">
          <i class="fas fa-check-double mr-1"></i> Conferir
        </button>
      </form>

      <!-- Erro -->
      <div v-if="confError" class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
        <i class="fas fa-exclamation-triangle text-yellow-500 mr-1"></i>
        <span class="text-sm text-yellow-700 dark:text-yellow-300">{{ confError }}</span>
      </div>

      <!-- Resultado -->
      <div v-if="confResultado" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-slide-up">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-gray-900 dark:text-white">Concurso {{ confResultado.numeroConcurso }}</span>
          <span class="text-xs text-gray-500">{{ confResultado.dataSorteio }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div :class="['text-center p-3 rounded-lg', confResultado.quantidadeAcertos >= 11 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700']">
            <p class="text-2xl font-bold" :class="confResultado.quantidadeAcertos >= 11 ? 'text-green-700' : 'text-gray-700 dark:text-gray-300'">{{ confResultado.quantidadeAcertos }}</p>
            <p class="text-xs text-gray-500">acertos</p>
          </div>
          <div :class="['text-center p-3 rounded-lg', confResultado.premiacao !== 'Sem premiação' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700']">
            <p class="text-sm font-bold"><i class="fas fa-trophy mr-1"></i> {{ confResultado.premiacao }}</p>
            <p class="text-xs text-gray-500 mt-0.5">faixa</p>
          </div>
        </div>
        <div class="mb-3">
          <p class="text-xs text-gray-500 mb-1.5 uppercase font-medium">Seus números:</p>
          <div class="flex flex-wrap gap-1">
            <span v-for="n in confResultado.numerosConferidos" :key="n" :class="['w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full', confResultado.acertos.includes(n) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600']">
              {{ String(n).padStart(2, '0') }}
            </span>
          </div>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1.5 uppercase font-medium">Sorteados:</p>
          <div class="flex flex-wrap gap-1">
            <span v-for="n in confResultado.numerosSorteados" :key="n" :class="['w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full', confResultado.acertos.includes(n) ? 'bg-green-500 text-white' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700']">
              {{ String(n).padStart(2, '0') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <TipCard class="mt-6">
      Combine números frequentes com atrasados e respeite o padrão de par/ímpar para apostas mais estratégicas. Use o <NuxtLink to="/simulador" class="underline">Simulador</NuxtLink> com a estratégia Alta Precisão.
    </TipCard>
  </div>
</template>
