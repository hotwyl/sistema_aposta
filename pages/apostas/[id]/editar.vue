<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useSeo({ title: 'Editar Aposta', description: 'Edite os dados de uma aposta cadastrada.' })

const loading = useLoadingStore()
const alert = useAlert()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const { data: response } = await useFetch(`/api/apostas/${id}`)
const aposta = computed(() => response.value?.data)

const tipoLoteria = ref(aposta.value?.tipoLoteria || 'lotofacil')
const numerosEscolhidos = ref<number[]>((aposta.value?.numeros as number[]) || [])
const valorAposta = ref(Number(aposta.value?.valorAposta) || 0)
const dataAposta = ref(aposta.value?.dataAposta || '')
const observacoes = ref(aposta.value?.observacoes || '')
const isFavorita = ref(aposta.value?.isFavorita || false)

const totalNumeros = computed(() => tipoLoteria.value === 'lotofacil' ? 25 : 100)
const maxNumeros = computed(() => tipoLoteria.value === 'lotofacil' ? 20 : 50)
const inicioNumero = computed(() => tipoLoteria.value === 'lotofacil' ? 1 : 0)

function toggleNumero(n: number) {
  const idx = numerosEscolhidos.value.indexOf(n)
  if (idx > -1) {
    numerosEscolhidos.value.splice(idx, 1)
  } else if (numerosEscolhidos.value.length < maxNumeros.value) {
    numerosEscolhidos.value.push(n)
    numerosEscolhidos.value.sort((a, b) => a - b)
  } else {
    alert.warning('Limite', `Máximo de ${maxNumeros.value} números.`)
  }
}

async function salvar() {
  loading.show('Atualizando aposta...')
  try {
    await $fetch(`/api/apostas/${id}`, {
      method: 'PUT',
      body: {
        tipoLoteria: tipoLoteria.value,
        numeros: numerosEscolhidos.value,
        valorAposta: valorAposta.value,
        dataAposta: dataAposta.value || null,
        observacoes: observacoes.value || null,
        isFavorita: isFavorita.value,
      },
    })
    alert.success('Aposta atualizada!')
    router.push('/apostas')
  } catch {
    alert.error('Erro', 'Falha ao atualizar.')
  } finally {
    loading.hide()
  }
}
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
    <AppBreadcrumb :items="[
      { label: 'Apostas', to: '/apostas' },
      { label: 'Editar' }
    ]" />

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-6">
      <i class="fas fa-edit text-yellow-600 mr-2"></i> Editar Aposta
    </h1>

    <form class="card p-6" autocomplete="off" @submit.prevent="salvar">
      <div class="mb-6">
        <label class="form-label">Tipo de Loteria</label>
        <select v-model="tipoLoteria" class="form-input" autocomplete="off">
          <option value="lotofacil">Lotofácil</option>
          <option value="lotomania">Lotomania</option>
        </select>
      </div>

      <div class="mb-6">
        <label class="form-label">Números ({{ numerosEscolhidos.length }}/{{ maxNumeros }})</label>
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

      <div class="mb-6">
        <label class="form-label">Valor (R$)</label>
        <input v-model.number="valorAposta" type="number" step="0.01" min="0" class="form-input" autocomplete="off">
      </div>

      <div class="mb-6">
        <label class="form-label">Data</label>
        <input v-model="dataAposta" type="date" class="form-input" autocomplete="off">
      </div>

      <div class="mb-6">
        <label class="form-label">Observações</label>
        <textarea v-model="observacoes" rows="3" class="form-input" autocomplete="off"></textarea>
      </div>

      <div class="mb-6">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input v-model="isFavorita" type="checkbox" class="rounded border-gray-300 text-brand-600 focus:ring-brand-500">
          <span class="text-sm text-gray-700 dark:text-gray-300"><i class="fas fa-heart text-red-400 mr-1"></i> Favorita</span>
        </label>
      </div>

      <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <NuxtLink to="/apostas" class="btn-secondary">Cancelar</NuxtLink>
        <button type="submit" class="btn-primary">
          <i class="fas fa-save mr-1"></i> Salvar
        </button>
      </div>
    </form>
  </div>
</template>
