<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useSeo({ title: 'Nova Aposta', path: '/apostas/nova', description: 'Cadastre uma nova aposta da Lotofácil ou Lotomania.' })

const loading = useLoadingStore()
const alert = useAlert()
const router = useRouter()

const tipoLoteria = ref<'lotofacil' | 'lotomania'>('lotofacil')
const numerosEscolhidos = ref<number[]>([])
const valorAposta = ref(0)
const dataAposta = ref(new Date().toISOString().split('T')[0])
const observacoes = ref('')
const isFavorita = ref(false)

const totalNumeros = computed(() => tipoLoteria.value === 'lotofacil' ? 25 : 100)
const maxNumeros = computed(() => tipoLoteria.value === 'lotofacil' ? 20 : 50)
const minNumeros = computed(() => tipoLoteria.value === 'lotofacil' ? 15 : 50)
const inicioNumero = computed(() => tipoLoteria.value === 'lotofacil' ? 1 : 0)

function toggleNumero(n: number) {
  const index = numerosEscolhidos.value.indexOf(n)
  if (index > -1) {
    numerosEscolhidos.value.splice(index, 1)
  } else if (numerosEscolhidos.value.length < maxNumeros.value) {
    numerosEscolhidos.value.push(n)
    numerosEscolhidos.value.sort((a, b) => a - b)
  } else {
    alert.warning('Limite atingido', `Máximo de ${maxNumeros.value} números.`)
  }
}

function resetNumeros() {
  numerosEscolhidos.value = []
}

async function salvar() {
  if (numerosEscolhidos.value.length < minNumeros.value) {
    alert.warning('Números insuficientes', `Selecione pelo menos ${minNumeros.value} números.`)
    return
  }

  loading.show('Salvando aposta...')
  try {
    await $fetch('/api/apostas', {
      method: 'POST',
      body: {
        tipoLoteria: tipoLoteria.value,
        numeros: numerosEscolhidos.value,
        valorAposta: valorAposta.value,
        dataAposta: dataAposta.value || null,
        observacoes: observacoes.value || null,
        isFavorita: isFavorita.value,
      },
    })
    alert.success('Aposta registrada com sucesso!')
    router.push('/apostas')
  } catch (err: unknown) {
    const message = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Erro ao salvar.'
    alert.error('Erro', message)
  } finally {
    loading.hide()
  }
}

watch(tipoLoteria, resetNumeros)
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Apostas', to: '/apostas' }, { label: 'Nova' }]" />

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-6">
      <i class="fas fa-plus-circle text-brand-600 dark:text-brand-400 mr-2"></i> Nova Aposta
    </h1>

    <!-- Dica -->
    <TipCard class="mb-6">
      Selecione o tipo de loteria primeiro. Na Lotofácil, escolha de 15 a 20 números entre 1 e 25. Na Lotomania, escolha 50 números entre 0 e 99.
    </TipCard>

    <form class="card p-6" autocomplete="off" @submit.prevent="salvar">
      <!-- Tipo -->
      <div class="mb-6">
        <label class="form-label">
          Tipo de Loteria <span class="text-red-500">*</span>
          <TooltipHelp text="Escolha entre Lotofácil ou Lotomania" />
        </label>
        <select v-model="tipoLoteria" class="form-input" autocomplete="off">
          <option value="lotofacil">Lotofácil</option>
          <option value="lotomania">Lotomania</option>
        </select>
      </div>

      <!-- Seleção de Números -->
      <div class="mb-6">
        <label class="form-label">
          Números <span class="text-red-500">*</span>
          <span class="text-xs text-gray-500 ml-2">({{ numerosEscolhidos.length }}/{{ maxNumeros }} selecionados)</span>
        </label>
        <div class="grid gap-1" :class="tipoLoteria === 'lotofacil' ? 'grid-cols-5 sm:grid-cols-10' : 'grid-cols-10'">
          <button
            v-for="i in totalNumeros"
            :key="i"
            type="button"
            :class="[
              'w-8 h-8 sm:w-9 sm:h-9 text-xs font-medium rounded-lg border transition flex items-center justify-center',
              numerosEscolhidos.includes(i - 1 + inicioNumero)
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-brand-400'
            ]"
            @click="toggleNumero(i - 1 + inicioNumero)"
          >
            {{ String(i - 1 + inicioNumero).padStart(2, '0') }}
          </button>
        </div>
      </div>

      <!-- Valor -->
      <div class="mb-6">
        <label class="form-label">
          Valor da Aposta (R$) <TooltipHelp text="Informe o valor pago pela aposta" />
        </label>
        <input v-model.number="valorAposta" type="number" step="0.01" min="0" class="form-input" placeholder="0,00" autocomplete="off">
      </div>

      <!-- Data -->
      <div class="mb-6">
        <label class="form-label">Data da Aposta</label>
        <input v-model="dataAposta" type="date" class="form-input" autocomplete="off">
      </div>

      <!-- Observações -->
      <div class="mb-6">
        <label class="form-label">Observações</label>
        <textarea v-model="observacoes" rows="3" class="form-input" placeholder="Anotações sobre esta aposta (opcional)" autocomplete="off"></textarea>
      </div>

      <!-- Favorita -->
      <div class="mb-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input v-model="isFavorita" type="checkbox" class="rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500">
          <span class="text-sm text-gray-700 dark:text-gray-300"><i class="fas fa-heart text-red-400 mr-1"></i> Marcar como favorita</span>
        </label>
      </div>

      <!-- Botões -->
      <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink to="/apostas" class="btn-secondary">Cancelar</NuxtLink>
        <button type="submit" class="btn-primary">
          <i class="fas fa-save mr-1"></i> Salvar Aposta
        </button>
      </div>
    </form>
  </div>
</template>
