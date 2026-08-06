<script setup lang="ts">
import { useLoadingStore } from '~/stores/loading'
import { useAlert } from '~/composables/useAlert'

useHead({ title: 'Importador de Dados - Sistema de Aposta' })

const loading = useLoadingStore()
const alert = useAlert()

// Tab control
const activeTab = ref<'concursos' | 'apostas'>('concursos')

// Concursos form
const tipoLoteriaConcurso = ref('lotofacil')
const fileNameConcurso = ref('')
const fileInputConcurso = ref<HTMLInputElement | null>(null)

// Apostas form
const tipoLoteriaAposta = ref('lotofacil')
const fileNameAposta = ref('')
const fileInputAposta = ref<HTMLInputElement | null>(null)

function onFileChangeConcurso(e: Event) {
  const target = e.target as HTMLInputElement
  fileNameConcurso.value = target.files?.[0]?.name || ''
}

function onFileChangeAposta(e: Event) {
  const target = e.target as HTMLInputElement
  fileNameAposta.value = target.files?.[0]?.name || ''
}

async function importarConcursos() {
  if (!fileInputConcurso.value?.files?.[0]) {
    alert.warning('Atenção', 'Selecione um arquivo.')
    return
  }

  const formData = new FormData()
  formData.append('arquivo', fileInputConcurso.value.files[0])
  formData.append('tipoLoteria', tipoLoteriaConcurso.value)

  loading.show('Importando concursos...')
  try {
    const res = await $fetch('/api/importador/importar', {
      method: 'POST',
      body: formData,
    })
    const msg = (res as { message: string }).message
    alert.success('Importação concluída!', msg)
    fileNameConcurso.value = ''
    if (fileInputConcurso.value) fileInputConcurso.value.value = ''
  } catch (err: unknown) {
    const message = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Erro ao importar.'
    alert.error('Erro', message)
  } finally {
    loading.hide()
  }
}

async function importarApostas() {
  if (!fileInputAposta.value?.files?.[0]) {
    alert.warning('Atenção', 'Selecione um arquivo.')
    return
  }

  const formData = new FormData()
  formData.append('arquivo', fileInputAposta.value.files[0])
  formData.append('tipoLoteria', tipoLoteriaAposta.value)

  loading.show('Importando apostas...')
  try {
    const res = await $fetch('/api/importador/apostas', {
      method: 'POST',
      body: formData,
    })
    const msg = (res as { message: string }).message
    alert.success('Importação concluída!', msg)
    fileNameAposta.value = ''
    if (fileInputAposta.value) fileInputAposta.value.value = ''
  } catch (err: unknown) {
    const message = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Erro ao importar.'
    alert.error('Erro', message)
  } finally {
    loading.hide()
  }
}
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
    <AppBreadcrumb :items="[{ label: 'Importador' }]" />

    <div class="flex items-center justify-between mt-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <i class="fas fa-file-import text-yellow-600 mr-2"></i> Importador
      </h1>
      <TooltipHelp text="Importe resultados de concursos ou apostas via CSV/XLS/XLSX." />
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button
        class="px-4 py-3 text-sm font-medium transition-colors"
        :class="activeTab === 'concursos'
          ? 'text-brand-600 border-b-2 border-brand-600'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
        @click="activeTab = 'concursos'"
      >
        <i class="fas fa-trophy mr-2"></i> Concursos
      </button>
      <button
        class="px-4 py-3 text-sm font-medium transition-colors"
        :class="activeTab === 'apostas'
          ? 'text-brand-600 border-b-2 border-brand-600'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
        @click="activeTab = 'apostas'"
      >
        <i class="fas fa-ticket-alt mr-2"></i> Apostas
      </button>
    </div>

    <!-- Tab: Concursos -->
    <div v-show="activeTab === 'concursos'">
      <!-- Instruções Concursos -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-info-circle text-blue-500 mr-2"></i> Como Importar Concursos
        </h2>
        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Baixe os resultados no site da <a href="https://loterias.caixa.gov.br" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:underline">Caixa Econômica Federal</a>.</p>
          </div>
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>O arquivo deve conter: <strong>Nº Concurso | Data | Números sorteados</strong>.</p>
          </div>
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>Formatos aceitos: <strong>CSV, XLS, XLSX</strong>.</p>
          </div>
        </div>
      </div>

      <!-- Upload Concursos -->
      <form class="card p-6" autocomplete="off" @submit.prevent="importarConcursos">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-upload text-green-500 mr-2"></i> Enviar Arquivo de Concursos
        </h2>
        <div class="space-y-4">
          <div>
            <label class="form-label">Tipo de Loteria <span class="text-red-500">*</span></label>
            <select v-model="tipoLoteriaConcurso" class="form-input" autocomplete="off">
              <option value="lotofacil">Lotofácil</option>
              <option value="lotomania">Lotomania</option>
            </select>
          </div>
          <div>
            <label class="form-label">Arquivo <span class="text-red-500">*</span></label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-brand-400 transition">
              <div class="space-y-1 text-center">
                <i class="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                <div class="flex text-sm text-gray-600 dark:text-gray-400">
                  <label class="relative cursor-pointer font-medium text-brand-600 hover:text-brand-500">
                    <span>Selecionar arquivo</span>
                    <input ref="fileInputConcurso" type="file" class="sr-only" accept=".csv,.xls,.xlsx" @change="onFileChangeConcurso">
                  </label>
                </div>
                <p class="text-xs text-gray-500">CSV, XLS ou XLSX até 15MB</p>
                <p v-if="fileNameConcurso" class="text-sm text-brand-600 font-medium mt-2">{{ fileNameConcurso }}</p>
              </div>
            </div>
          </div>
          <button type="submit" class="w-full btn-primary justify-center">
            <i class="fas fa-file-import mr-2"></i> Importar Concursos
          </button>
        </div>
      </form>
    </div>

    <!-- Tab: Apostas -->
    <div v-show="activeTab === 'apostas'">
      <!-- Instruções Apostas -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-info-circle text-blue-500 mr-2"></i> Como Importar Apostas
        </h2>
        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Prepare um arquivo com <strong>uma aposta por linha</strong>.</p>
          </div>
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>Cada linha deve conter os números da aposta separados por vírgula, ponto-e-vírgula, espaço ou traço.</p>
          </div>
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p class="mb-1">Exemplo para <strong>Lotofácil</strong> (15 a 20 números de 1 a 25):</p>
              <code class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">01;02;03;04;05;06;07;08;09;10;11;12;13;14;15</code>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <span class="flex-shrink-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p class="mb-1">Exemplo para <strong>Lotomania</strong> (50 números de 0 a 99):</p>
              <code class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">00;01;02;03;04;...;49</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Apostas -->
      <form class="card p-6" autocomplete="off" @submit.prevent="importarApostas">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          <i class="fas fa-upload text-green-500 mr-2"></i> Enviar Arquivo de Apostas
        </h2>
        <div class="space-y-4">
          <div>
            <label class="form-label">Tipo de Loteria <span class="text-red-500">*</span></label>
            <select v-model="tipoLoteriaAposta" class="form-input" autocomplete="off">
              <option value="lotofacil">Lotofácil</option>
              <option value="lotomania">Lotomania</option>
            </select>
          </div>
          <div>
            <label class="form-label">Arquivo <span class="text-red-500">*</span></label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-brand-400 transition">
              <div class="space-y-1 text-center">
                <i class="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                <div class="flex text-sm text-gray-600 dark:text-gray-400">
                  <label class="relative cursor-pointer font-medium text-brand-600 hover:text-brand-500">
                    <span>Selecionar arquivo</span>
                    <input ref="fileInputAposta" type="file" class="sr-only" accept=".csv,.xls,.xlsx,.txt" @change="onFileChangeAposta">
                  </label>
                </div>
                <p class="text-xs text-gray-500">CSV, XLS, XLSX ou TXT até 15MB</p>
                <p v-if="fileNameAposta" class="text-sm text-brand-600 font-medium mt-2">{{ fileNameAposta }}</p>
              </div>
            </div>
          </div>
          <button type="submit" class="w-full btn-primary justify-center">
            <i class="fas fa-file-import mr-2"></i> Importar Apostas
          </button>
        </div>
      </form>
    </div>

    <TipCard variant="yellow" class="mt-6">
      <span v-if="activeTab === 'concursos'">Mantenha a base atualizada importando os resultados regularmente para melhorar a análise.</span>
      <span v-else>Importe suas apostas em lote para conferir resultados e analisar padrões.</span>
    </TipCard>
  </div>
</template>
