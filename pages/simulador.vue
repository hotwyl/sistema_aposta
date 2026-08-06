<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useHead({ title: 'Simulador de Números - Sistema de Aposta' })

const loading = useLoadingStore()
const alert = useAlert()

const tipoLoteria = ref<'lotofacil' | 'lotomania'>('lotofacil')
const estrategia = ref('aleatorio')
const quantidadeJogos = ref(5)
const quantidadeNumeros = ref(15)
const resultados = ref<number[][]>([])
const iaProvider = ref('')
const iaLoading = ref(false)
const salvando = ref<number | null>(null)

async function gerar() {
  loading.show('Gerando números...')
  iaProvider.value = ''
  try {
    const res = await $fetch('/api/simulador/gerar', {
      method: 'POST',
      body: {
        tipoLoteria: tipoLoteria.value,
        estrategia: estrategia.value,
        quantidadeJogos: quantidadeJogos.value,
        quantidadeNumeros: quantidadeNumeros.value,
      },
    })
    resultados.value = (res as { data: { jogos: number[][] } }).data.jogos
  } catch {
    alert.error('Erro', 'Falha ao gerar números.')
  } finally {
    loading.hide()
  }
}

async function gerarComIA() {
  iaLoading.value = true
  iaProvider.value = ''
  loading.show('Gerando apostas com IA...')
  try {
    const res = await $fetch('/api/simulador/gerar-ia', {
      method: 'POST',
      body: {
        tipoLoteria: tipoLoteria.value,
        quantidadeJogos: quantidadeJogos.value,
      },
    })
    const data = (res as { data: { sucesso: boolean; jogos?: number[][]; numeros?: number[]; provider?: string; mensagem?: string } }).data
    if (data.sucesso && (data.jogos || data.numeros)) {
      resultados.value = data.jogos || (data.numeros ? [data.numeros] : [])
      iaProvider.value = data.provider || ''
      alert.success('Apostas geradas por IA!', `${resultados.value.length} jogo(s) via ${data.provider}`)
    } else {
      alert.warning('IA', data.mensagem || 'Não foi possível gerar. Tente novamente.')
    }
  } catch (err: unknown) {
    const message = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Falha na geração por IA.'
    alert.error('Erro', message)
  } finally {
    iaLoading.value = false
    loading.hide()
  }
}

async function salvarAposta(index: number) {
  const numeros = resultados.value[index]
  if (!numeros) return

  salvando.value = index
  try {
    await $fetch('/api/apostas', {
      method: 'POST',
      body: {
        tipoLoteria: tipoLoteria.value,
        numeros,
        valorAposta: 0,
        isFavorita: false,
        observacoes: `Gerada pelo simulador (${estrategia.value})`,
      },
    })
    alert.success('Aposta salva!', `Jogo ${index + 1} registrado com sucesso.`)
  } catch {
    alert.error('Erro', 'Não foi possível salvar a aposta.')
  } finally {
    salvando.value = null
  }
}

async function salvarTodas() {
  if (resultados.value.length === 0) return

  const result = await alert.confirm('Salvar todas?', `Serão salvas ${resultados.value.length} apostas.`)
  if (!result.isConfirmed) return

  loading.show('Salvando apostas...')
  let salvou = 0
  try {
    for (const numeros of resultados.value) {
      await $fetch('/api/apostas', {
        method: 'POST',
        body: {
          tipoLoteria: tipoLoteria.value,
          numeros,
          valorAposta: 0,
          isFavorita: false,
          observacoes: `Gerada pelo simulador (${estrategia.value})`,
        },
      })
      salvou++
    }
    alert.success('Apostas salvas!', `${salvou} apostas registradas.`)
  } catch {
    alert.error('Erro', `Salvas ${salvou} de ${resultados.value.length}. Algumas falharam.`)
  } finally {
    loading.hide()
  }
}
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <AppBreadcrumb :items="[{ label: 'Simulador' }]" />

    <div class="flex items-center justify-between mt-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <i class="fas fa-dice text-green-600 mr-2"></i> Simulador
      </h1>
      <TooltipHelp text="Gere combinações de números usando diferentes estratégias." />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="lg:col-span-1">
        <form class="card p-6 sticky top-24" autocomplete="off" @submit.prevent="gerar">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i class="fas fa-cog text-gray-400 mr-2"></i> Configurações
          </h2>

          <div class="space-y-4">
            <div>
              <label class="form-label">Tipo de Loteria</label>
              <select v-model="tipoLoteria" class="form-input" autocomplete="off">
                <option value="lotofacil">Lotofácil (15 de 25)</option>
                <option value="lotomania">Lotomania (50 de 100)</option>
              </select>
            </div>
            <div>
              <label class="form-label">Estratégia</label>
              <select v-model="estrategia" class="form-input" autocomplete="off">
                <option value="aleatorio">Aleatório</option>
                <option value="frequencia">Baseado em Frequência</option>
                <option value="precisao">Alta Precisão (Recomendado)</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                <span v-if="estrategia === 'aleatorio'">Seleção puramente aleatória.</span>
                <span v-else-if="estrategia === 'frequencia'">Prioriza números mais sorteados historicamente.</span>
                <span v-else>Combina frequência, atrasos, par/ímpar, faixas e repetições para máxima probabilidade.</span>
              </p>
            </div>
            <div>
              <label class="form-label">Jogos (1-20)</label>
              <input v-model.number="quantidadeJogos" type="number" min="1" max="20" class="form-input" autocomplete="off">
            </div>
            <div v-if="tipoLoteria === 'lotofacil'">
              <label class="form-label">Números por Jogo (15-20)</label>
              <input v-model.number="quantidadeNumeros" type="number" min="15" max="20" class="form-input" autocomplete="off">
            </div>
            <button type="submit" class="w-full btn-primary justify-center">
              <i class="fas fa-dice mr-2"></i> Gerar Números
            </button>

            <button type="button" class="w-full btn-secondary justify-center mt-2" :disabled="iaLoading" @click="gerarComIA">
              <i :class="['fas mr-2', iaLoading ? 'fa-spinner fa-spin' : 'fa-robot']"></i>
              {{ iaLoading ? 'Gerando...' : 'Gerar com IA' }}
            </button>
          </div>

          <TipCard variant="green" class="mt-4">
            A estratégia <strong>Avançada</strong> analisa padrões de par/ímpar e repetições entre concursos.
          </TipCard>
        </form>
      </div>

      <!-- Results -->
      <div class="lg:col-span-2">
        <template v-if="resultados.length > 0">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Resultados ({{ resultados.length }} jogos)
              </h2>
              <div class="flex items-center space-x-2">
                <span v-if="iaProvider" class="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  <i class="fas fa-robot mr-1"></i> {{ iaProvider }}
                </span>
                <button class="btn-primary btn-sm" @click="salvarTodas">
                  <i class="fas fa-save mr-1"></i> Salvar Todas
                </button>
              </div>
            </div>
            <div v-for="(jogo, i) in resultados" :key="i" class="card p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-500">Jogo {{ i + 1 }}</span>
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-gray-400">{{ jogo.length }} números</span>
                  <button
                    class="px-2 py-1 text-xs rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition"
                    :disabled="salvando === i"
                    @click="salvarAposta(i)"
                  >
                    <i :class="['fas mr-1', salvando === i ? 'fa-spinner fa-spin' : 'fa-save']"></i>
                    {{ salvando === i ? 'Salvando...' : 'Salvar' }}
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="num in jogo" :key="num" class="w-9 h-9 flex items-center justify-center bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-bold rounded-full">
                  {{ String(num).padStart(2, '0') }}
                </span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="card p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-dice text-3xl text-gray-300 dark:text-gray-600"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum jogo gerado</h3>
          <p class="text-gray-500 text-sm">Configure e clique em "Gerar Números".</p>
        </div>
      </div>
    </div>
  </div>
</template>
