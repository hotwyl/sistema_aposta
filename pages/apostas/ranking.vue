<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'

useHead({ title: 'Ranking de Apostas - Sistema de Aposta' })

const loading = useLoadingStore()

const tipoLoteria = ref<'lotofacil' | 'lotomania'>('lotofacil')
const concursoSelecionado = ref('')
const apostaExpandida = ref<string | null>(null)

const { data: response, refresh, status } = await useFetch('/api/apostas/ranking', {
  query: { tipo: tipoLoteria, concursoId: concursoSelecionado },
  watch: [tipoLoteria, concursoSelecionado],
})

const dados = computed(() => response.value?.data as any || null)
const ranking = computed(() => dados.value?.ranking || [])
const concurso = computed(() => dados.value?.concurso || null)
const melhorAposta = computed(() => dados.value?.melhorAposta || null)
const maiorPremiacao = computed(() => dados.value?.maiorPremiacao || null)
const maiorHistorico = computed(() => dados.value?.maiorAcertosHistorico || null)
const acertosHistoricos = computed(() => dados.value?.acertosHistoricos || [])
const concursosDisponiveis = computed(() => dados.value?.concursosDisponiveis || [])

function formatNumeros(nums: number[], limit = 0): string {
  const sorted = [...nums].sort((a, b) => a - b)
  const show = limit > 0 ? sorted.slice(0, limit) : sorted
  return show.map(n => String(n).padStart(2, '0')).join(', ') + (limit > 0 && sorted.length > limit ? '...' : '')
}

function toggleExpand(id: string) {
  apostaExpandida.value = apostaExpandida.value === id ? null : id
}

function getMedalClass(index: number): string {
  if (index === 0) return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-300'
  if (index === 1) return 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 border-gray-300'
  if (index === 2) return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300'
  return 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
}

function getMedalIcon(index: number): string {
  if (index === 0) return 'fas fa-trophy text-yellow-500'
  if (index === 1) return 'fas fa-medal text-gray-400'
  if (index === 2) return 'fas fa-medal text-orange-400'
  return 'fas fa-hashtag text-gray-400'
}

// IA Analysis
const iaLoading = ref(false)
const iaAnalise = ref<any>(null)

async function carregarAnaliseIA() {
  iaLoading.value = true
  try {
    const res = await $fetch(`/api/estatisticas/analise-ia?tipo=${tipoLoteria.value}`)
    iaAnalise.value = (res as any).data
  } catch {
    iaAnalise.value = { disponivel: false, mensagem: 'Erro ao carregar análise.' }
  } finally {
    iaLoading.value = false
  }
}
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Apostas', to: '/apostas' }, { label: 'Ranking' }]" />

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        <i class="fas fa-ranking-star text-yellow-500 mr-2"></i> Ranking de Apostas
      </h1>
      <TooltipHelp text="Ranking das apostas comparadas com o concurso selecionado. Por padrão, usa o último concurso." />
    </div>

    <!-- Filtros -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="form-label text-xs">Tipo de Loteria</label>
          <select v-model="tipoLoteria" class="form-input" @change="concursoSelecionado = ''">
            <option value="lotofacil">Lotofácil</option>
            <option value="lotomania">Lotomania</option>
          </select>
        </div>
        <div>
          <label class="form-label text-xs">Concurso de Referência</label>
          <select v-model="concursoSelecionado" class="form-input">
            <option value="">Último concurso</option>
            <option v-for="c in concursosDisponiveis" :key="c.id" :value="c.id">
              Concurso {{ c.numeroConcurso }} — {{ c.dataSorteio }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="card p-12 text-center">
      <i class="fas fa-spinner fa-spin text-2xl text-brand-500 mb-3"></i>
      <p class="text-gray-500">Calculando ranking...</p>
    </div>

    <!-- Sem dados -->
    <div v-else-if="dados?.mensagem && !ranking.length" class="card p-12 text-center">
      <i class="fas fa-info-circle text-3xl text-blue-400 mb-3"></i>
      <p class="text-gray-600 dark:text-gray-400">{{ dados.mensagem }}</p>
      <div class="mt-4 flex gap-3 justify-center">
        <NuxtLink to="/importador" class="btn-primary btn-sm"><i class="fas fa-file-import mr-1"></i> Importar Concursos</NuxtLink>
        <NuxtLink to="/apostas/nova" class="btn-secondary btn-sm"><i class="fas fa-plus mr-1"></i> Nova Aposta</NuxtLink>
      </div>
    </div>

    <template v-else-if="ranking.length > 0">
      <!-- Concurso de referência -->
      <div v-if="concurso" class="card p-4 mb-6 border-l-4 border-brand-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-calendar-check text-brand-500 mr-1"></i>
              Concurso {{ concurso.numero }} — {{ concurso.data }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Números sorteados:</p>
          </div>
          <span class="text-xs text-gray-400">{{ dados.totalApostas }} apostas analisadas</span>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span v-for="n in concurso.numeros" :key="n" class="w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full bg-brand-600 text-white">
            {{ String(n).padStart(2, '0') }}
          </span>
        </div>
      </div>

      <!-- Destaques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Melhor Aposta -->
        <div class="card p-4 border-t-4 border-yellow-400">
          <div class="flex items-center space-x-2 mb-2">
            <i class="fas fa-trophy text-yellow-500"></i>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Melhor Aposta</h3>
          </div>
          <template v-if="melhorAposta">
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ melhorAposta.quantidadeAcertos }}</p>
            <p class="text-xs text-gray-500">acertos no concurso</p>
            <p class="text-xs font-medium mt-1" :class="melhorAposta.temPremiacao ? 'text-green-600' : 'text-gray-400'">
              {{ melhorAposta.faixa }}
            </p>
            <p class="text-xs text-gray-400 mt-1 font-mono truncate">{{ formatNumeros(melhorAposta.numeros, 8) }}</p>
            <NuxtLink :to="`/apostas/${melhorAposta.id}`" class="inline-flex items-center mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
              <i class="fas fa-external-link-alt mr-1"></i> Ver aposta
            </NuxtLink>
          </template>
          <p v-else class="text-xs text-gray-400">Sem dados</p>
        </div>

        <!-- Maior Premiação -->
        <div class="card p-4 border-t-4 border-green-400">
          <div class="flex items-center space-x-2 mb-2">
            <i class="fas fa-coins text-green-500"></i>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Maior Premiação</h3>
          </div>
          <template v-if="maiorPremiacao">
            <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ maiorPremiacao.faixa }}</p>
            <p class="text-xs text-gray-500">{{ maiorPremiacao.quantidadeAcertos }} acertos</p>
            <p class="text-xs text-gray-400 mt-1 font-mono truncate">{{ formatNumeros(maiorPremiacao.numeros, 8) }}</p>
            <NuxtLink :to="`/apostas/${maiorPremiacao.id}`" class="inline-flex items-center mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
              <i class="fas fa-external-link-alt mr-1"></i> Ver aposta
            </NuxtLink>
          </template>
          <p v-else class="text-sm text-gray-400">Nenhuma com premiação</p>
        </div>

        <!-- Melhor Histórico -->
        <div class="card p-4 border-t-4 border-purple-400">
          <div class="flex items-center space-x-2 mb-2">
            <i class="fas fa-chart-line text-purple-500"></i>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Melhor Histórico</h3>
          </div>
          <template v-if="maiorHistorico">
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ maiorHistorico.mediaAcertos }}</p>
            <p class="text-xs text-gray-500">média de acertos/concurso</p>
            <p class="text-xs text-gray-400 mt-1">
              Melhor: {{ maiorHistorico.melhorAcertoHistorico }} acertos |
              Premiou {{ maiorHistorico.concursosComPremiacao }}x em {{ maiorHistorico.concursosAnalisados }}
            </p>
            <NuxtLink :to="`/apostas/${maiorHistorico.id}`" class="inline-flex items-center mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
              <i class="fas fa-external-link-alt mr-1"></i> Ver aposta
            </NuxtLink>
          </template>
          <p v-else class="text-xs text-gray-400">Sem dados</p>
        </div>
      </div>

      <!-- Tabela de Ranking -->
      <div class="card">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
            <i class="fas fa-list-ol text-brand-500 mr-1"></i> Ranking Completo
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm" role="table" aria-label="Ranking de apostas">
            <thead class="bg-gray-50/80 dark:bg-gray-700/50">
              <tr>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Números</th>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acertos</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Faixa</th>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-16">Ver</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <template v-for="(item, idx) in ranking" :key="item.id">
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer" @click="toggleExpand(item.id)">
                  <td class="px-3 py-3 text-center">
                    <span :class="['inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border', getMedalClass(idx)]">
                      <i v-if="idx < 3" :class="getMedalIcon(idx)" class="text-xs"></i>
                      <span v-else>{{ idx + 1 }}</span>
                    </span>
                  </td>
                  <td class="px-3 py-3">
                    <span class="font-mono text-xs">{{ formatNumeros(item.numeros, 10) }}</span>
                    <i v-if="item.isFavorita" class="fas fa-heart text-red-400 ml-1 text-xs"></i>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span :class="['inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold', item.temPremiacao ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400']">
                      {{ item.quantidadeAcertos }}
                    </span>
                  </td>
                  <td class="px-3 py-3 hidden md:table-cell">
                    <span :class="['text-xs font-medium', item.temPremiacao ? 'text-green-600 dark:text-green-400' : 'text-gray-400']">
                      {{ item.faixa }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <i :class="['fas text-xs text-gray-400 transition-transform', apostaExpandida === item.id ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                  </td>
                </tr>
                <!-- Detalhe expandido -->
                <tr v-if="apostaExpandida === item.id">
                  <td colspan="5" class="px-4 py-4 bg-gray-50/80 dark:bg-gray-800/50">
                    <div class="space-y-3">
                      <p class="text-xs font-medium text-gray-500 uppercase">Comparação com Concurso {{ concurso?.numero }}:</p>
                      <div class="flex flex-wrap gap-1.5">
                        <span
                          v-for="n in item.numeros"
                          :key="n"
                          :class="['w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full', item.acertos.includes(n) ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400']"
                        >
                          {{ String(n).padStart(2, '0') }}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span><i class="fas fa-check text-green-500 mr-1"></i> {{ item.quantidadeAcertos }} acertos</span>
                        <span><i class="fas fa-dice mr-1"></i> {{ item.quantidadeNumeros }} números apostados</span>
                        <span v-if="item.dataAposta"><i class="fas fa-calendar mr-1"></i> {{ item.dataAposta }}</span>
                        <span v-if="item.observacoes"><i class="fas fa-comment mr-1"></i> {{ item.observacoes }}</span>
                      </div>
                      <div class="pt-2">
                        <NuxtLink :to="`/apostas/${item.id}`" class="text-xs text-brand-600 hover:underline">
                          <i class="fas fa-external-link-alt mr-1"></i> Ver detalhes completos
                        </NuxtLink>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top 10 Histórico -->
      <div v-if="acertosHistoricos.length > 0" class="card mt-6">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
            <i class="fas fa-history text-purple-500 mr-1"></i> Top 10 — Desempenho Histórico (últimos {{ acertosHistoricos[0]?.concursosAnalisados || 10 }} concursos)
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50/80 dark:bg-gray-700/50">
              <tr>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                <th scope="col" class="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Números</th>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Média</th>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Melhor</th>
                <th scope="col" class="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Premiou</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
              <tr v-for="(item, idx) in acertosHistoricos" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                <td class="px-3 py-3 text-center">
                  <span :class="['inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', idx < 3 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' : 'text-gray-400']">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="px-3 py-3 font-mono text-xs">{{ formatNumeros(item.numeros, 8) }}</td>
                <td class="px-3 py-3 text-center font-bold text-purple-600 dark:text-purple-400">{{ item.totalAcertos }}</td>
                <td class="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{{ item.mediaAcertos }}</td>
                <td class="px-3 py-3 text-center hidden sm:table-cell font-medium">{{ item.melhorAcertoHistorico }}</td>
                <td class="px-3 py-3 text-center hidden md:table-cell">
                  <span v-if="item.concursosComPremiacao > 0" class="text-green-600 font-medium">{{ item.concursosComPremiacao }}x</span>
                  <span v-else class="text-gray-400">—</span>
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
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
          <i class="fas fa-robot text-purple-500 mr-1"></i> Análise com Inteligência Artificial
        </h2>
        <button class="btn-primary btn-sm" :disabled="iaLoading" @click="carregarAnaliseIA">
          <i :class="['fas mr-1', iaLoading ? 'fa-spinner fa-spin' : 'fa-brain']"></i>
          {{ iaLoading ? 'Analisando...' : 'Gerar Insights' }}
        </button>
      </div>

      <div v-if="iaAnalise">
        <template v-if="iaAnalise.disponivel">
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 mb-4">
            <p class="text-sm text-purple-800 dark:text-purple-200">
              <i class="fas fa-quote-left text-purple-400 mr-1"></i> {{ iaAnalise.analise?.resumo }}
            </p>
            <p class="text-xs text-purple-500 mt-2"><i class="fas fa-robot mr-1"></i> {{ iaAnalise.provider }}</p>
          </div>
          <div v-if="iaAnalise.analise?.dicas?.length" class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div v-for="(dica, i) in iaAnalise.analise.dicas" :key="i" class="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <i class="fas fa-lightbulb text-yellow-500 text-xs mt-0.5"></i>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ dica }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-4">
            <div v-if="iaAnalise.analise?.numerosRecomendados?.length">
              <p class="text-xs text-gray-500 mb-1"><i class="fas fa-thumbs-up text-green-500 mr-1"></i> Recomendados</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="n in iaAnalise.analise.numerosRecomendados" :key="n" class="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 text-xs font-bold">{{ n }}</span>
              </div>
            </div>
            <div v-if="iaAnalise.analise?.numerosEvitar?.length">
              <p class="text-xs text-gray-500 mb-1"><i class="fas fa-thumbs-down text-red-500 mr-1"></i> Evitar</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="n in iaAnalise.analise.numerosEvitar" :key="n" class="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 text-xs font-bold">{{ n }}</span>
              </div>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-gray-500 text-center py-4">{{ iaAnalise.mensagem }}</p>
      </div>
      <p v-else class="text-xs text-gray-400 text-center py-4">Clique em "Gerar Insights" para obter recomendações da IA.</p>
    </div>

    <TipCard class="mt-6">
      Selecione um concurso diferente para comparar suas apostas. O ranking mostra acertos, faixa de premiação e desempenho histórico.
    </TipCard>
  </div>
</template>
