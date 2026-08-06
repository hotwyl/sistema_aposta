<script setup lang="ts">
import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'

useHead({ title: 'Detalhes da Aposta - Sistema de Aposta' })

const route = useRoute()
const id = route.params.id as string

const { data: response, status } = await useFetch(`/api/apostas/${id}/stats`)

const aposta = computed(() => response.value?.data?.aposta)
const metricas = computed(() => response.value?.data?.metricas)
const distribuicao = computed(() => response.value?.data?.distribuicao || [])
const frequenciaAcertos = computed(() => response.value?.data?.frequenciaAcertos || [])
const premiacoes = computed(() => response.value?.data?.premiacoes || [])
const historico = computed(() => response.value?.data?.historico || [])

// Columns for premiacoes table
interface Premiacao { concursoId: string; numeroConcurso: number; dataSorteio: string; quantidadeAcertos: number; faixa: string }
const colPrem = createColumnHelper<Premiacao>()
const colunasPremiacao = [
  colPrem.accessor('numeroConcurso', { header: 'Concurso', cell: (i) => h('span', { class: 'font-medium text-gray-900 dark:text-white' }, i.getValue()) }),
  colPrem.accessor('dataSorteio', { header: 'Data', cell: (i) => h('span', { class: 'text-gray-500 text-xs' }, i.getValue()) }),
  colPrem.accessor('quantidadeAcertos', { header: 'Acertos', cell: (i) => h('span', { class: 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold' }, i.getValue()) }),
  colPrem.accessor('faixa', { header: 'Faixa', cell: (i) => h('span', { class: 'text-green-600 dark:text-green-400 font-medium text-xs' }, i.getValue()) }),
]

// Columns for historico table
interface Historico { concursoId: string; numeroConcurso: number; dataSorteio: string; quantidadeAcertos: number; faixa: string; temPremiacao: boolean }
const colHist = createColumnHelper<Historico>()
const colunasHistorico = [
  colHist.accessor('numeroConcurso', { header: 'Concurso', cell: (i) => h('span', { class: 'font-medium text-gray-900 dark:text-white' }, i.getValue()) }),
  colHist.accessor('dataSorteio', { header: 'Data', cell: (i) => h('span', { class: 'text-gray-500 text-xs' }, i.getValue()) }),
  colHist.accessor('quantidadeAcertos', { header: 'Acertos', cell: (i) => {
    const val = i.getValue()
    const prem = i.row.original.temPremiacao
    return h('span', { class: `inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${prem ? 'bg-green-100 dark:bg-green-900/40 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}` }, val)
  }}),
  colHist.accessor('faixa', { header: 'Resultado', cell: (i) => h('span', { class: `text-xs font-medium ${i.row.original.temPremiacao ? 'text-green-600' : 'text-gray-400'}` }, i.getValue()) }),
]
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Apostas', to: '/apostas' }, { label: 'Detalhes' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <i class="fas fa-chart-bar text-brand-600 mr-2"></i> Detalhes da Aposta
      </h1>
      <div v-if="aposta" class="flex space-x-2">
        <NuxtLink :to="`/apostas/${id}/editar`" class="btn-primary btn-sm">
          <i class="fas fa-edit mr-1"></i> Editar
        </NuxtLink>
        <NuxtLink to="/apostas" class="btn-secondary btn-sm">
          <i class="fas fa-arrow-left mr-1"></i> Voltar
        </NuxtLink>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="card p-12 text-center">
      <i class="fas fa-spinner fa-spin text-2xl text-brand-500"></i>
      <p class="mt-3 text-gray-500">Carregando estatísticas...</p>
    </div>

    <template v-else-if="aposta">
      <!-- Info básica + Números -->
      <div class="card p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span :class="['badge text-sm px-3 py-1', aposta.tipoLoteria === 'lotofacil' ? 'badge-success' : 'badge-purple']">
              {{ aposta.tipoLoteria === 'lotofacil' ? 'Lotofácil' : 'Lotomania' }}
            </span>
            <span v-if="aposta.isFavorita" class="text-red-500 text-sm">
              <i class="fas fa-heart"></i> Favorita
            </span>
          </div>
          <div class="text-right text-xs text-gray-400">
            <p>Cadastrada em {{ new Date(aposta.createdAt).toLocaleDateString('pt-BR') }}</p>
            <p v-if="aposta.dataAposta">Aposta: {{ new Date(aposta.dataAposta).toLocaleDateString('pt-BR') }}</p>
          </div>
        </div>

        <p class="text-xs font-medium text-gray-500 mb-3 uppercase">Números Apostados ({{ aposta.quantidadeNumeros }})</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="n in (aposta.numeros as number[])"
            :key="n"
            class="w-9 h-9 flex items-center justify-center bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-bold rounded-full text-xs"
          >
            {{ String(n).padStart(2, '0') }}
          </span>
        </div>

        <div v-if="aposta.observacoes" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-500 mb-1">Observações:</p>
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ aposta.observacoes }}</p>
        </div>
      </div>

      <!-- Métricas / Indicadores -->
      <div v-if="metricas" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ metricas.mediaAcertos }}</p>
          <p class="text-xs text-gray-500 mt-1">Média de acertos</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ metricas.melhorAcerto }}</p>
          <p class="text-xs text-gray-500 mt-1">Melhor acerto</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ metricas.totalPremiacoes }}</p>
          <p class="text-xs text-gray-500 mt-1">Premiações</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ metricas.percentualPremiacao }}%</p>
          <p class="text-xs text-gray-500 mt-1">Taxa de premiação</p>
        </div>
      </div>

      <!-- Segunda linha de métricas -->
      <div v-if="metricas" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ metricas.totalConcursos }}</p>
          <p class="text-xs text-gray-500 mt-1">Concursos analisados</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-gray-700 dark:text-gray-300">{{ metricas.totalAcertos }}</p>
          <p class="text-xs text-gray-500 mt-1">Total de acertos</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-red-500">{{ metricas.piorAcerto }}</p>
          <p class="text-xs text-gray-500 mt-1">Pior acerto</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-bold text-orange-500">{{ metricas.sequenciaSemPremiacao }}</p>
          <p class="text-xs text-gray-500 mt-1">Concursos sem premiar</p>
        </div>
      </div>

      <!-- Premiações -->
      <div v-if="premiacoes.length > 0" class="card p-4 mb-6">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-trophy text-yellow-500 mr-1"></i> Premiações ({{ premiacoes.length }})
        </h2>
        <DataTable
          :data="premiacoes"
          :columns="colunasPremiacao"
          :page-size="10"
          :compact="true"
          search-placeholder="Buscar por concurso ou faixa..."
          empty-message="Nenhuma premiação."
          empty-icon="fa-trophy"
        />
      </div>

      <!-- Distribuição de acertos -->
      <div v-if="distribuicao.length > 0" class="card p-6 mb-6">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-chart-bar text-brand-500 mr-1"></i> Distribuição de Acertos
        </h2>
        <div class="space-y-2">
          <div v-for="d in distribuicao" :key="d.acertos" class="flex items-center gap-3">
            <span class="w-20 text-xs text-gray-500 text-right">{{ d.acertos }} acertos</span>
            <div class="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="d.acertos >= 11 ? 'bg-green-500' : d.acertos >= 9 ? 'bg-yellow-500' : 'bg-gray-400'"
                :style="{ width: `${metricas ? (d.vezes / metricas.totalConcursos) * 100 : 0}%` }"
              ></div>
            </div>
            <span class="w-12 text-xs text-gray-600 dark:text-gray-400 font-medium">{{ d.vezes }}x</span>
          </div>
        </div>
      </div>

      <!-- Frequência de acerto por número -->
      <div v-if="frequenciaAcertos.length > 0" class="card p-6 mb-6">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-fire text-orange-500 mr-1"></i> Desempenho por Número
          <span class="text-xs text-gray-400 font-normal ml-2">Quantas vezes cada número foi sorteado</span>
        </h2>
        <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
          <div
            v-for="f in frequenciaAcertos"
            :key="f.numero"
            class="text-center p-2 rounded-lg border"
            :class="f.percentual >= 60 ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : f.percentual >= 40 ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-200 dark:border-gray-700'"
          >
            <p class="text-sm font-bold text-gray-900 dark:text-white">{{ String(f.numero).padStart(2, '0') }}</p>
            <p class="text-xs text-gray-500">{{ f.vezes }}x</p>
            <p class="text-[10px] text-gray-400">{{ f.percentual }}%</p>
          </div>
        </div>
      </div>

      <!-- Histórico últimos concursos -->
      <div v-if="historico.length > 0" class="card p-4 mb-6">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-history text-purple-500 mr-1"></i> Histórico — Últimos {{ historico.length }} Concursos
        </h2>
        <DataTable
          :data="historico"
          :columns="colunasHistorico"
          :page-size="10"
          :compact="true"
          search-placeholder="Buscar por concurso..."
          empty-message="Nenhum histórico."
          empty-icon="fa-history"
        />
      </div>

      <!-- Sem concursos -->
      <div v-if="metricas && metricas.totalConcursos === 0" class="card p-8 text-center">
        <i class="fas fa-info-circle text-2xl text-blue-400 mb-3"></i>
        <p class="text-gray-600 dark:text-gray-400">Nenhum concurso importado para calcular estatísticas.</p>
        <NuxtLink to="/importador" class="btn-primary btn-sm mt-4">
          <i class="fas fa-file-import mr-1"></i> Importar Concursos
        </NuxtLink>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="card p-12 text-center">
      <i class="fas fa-exclamation-triangle text-3xl text-yellow-400 mb-3"></i>
      <p class="text-gray-600 dark:text-gray-400">Aposta não encontrada.</p>
      <NuxtLink to="/apostas" class="btn-secondary btn-sm mt-4">
        <i class="fas fa-arrow-left mr-1"></i> Voltar para Apostas
      </NuxtLink>
    </div>
  </div>
</template>
