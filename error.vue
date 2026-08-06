<script setup lang="ts">
defineProps(['error'])

const errorMessages: Record<number, { title: string; description: string; icon: string; suggestion: string }> = {
  400: { title: 'Requisição inválida', description: 'A requisição contém dados inválidos.', icon: 'fa-exclamation-circle', suggestion: 'Verifique os campos e tente novamente.' },
  403: { title: 'Acesso negado', description: 'Você não tem permissão para acessar este recurso.', icon: 'fa-lock', suggestion: 'Verifique se o endereço está correto.' },
  404: { title: 'Página não encontrada', description: 'A página que você procura não existe ou foi movida.', icon: 'fa-map-signs', suggestion: 'Verifique o endereço ou navegue pelo menu.' },
  408: { title: 'Tempo esgotado', description: 'O servidor demorou muito para responder.', icon: 'fa-clock', suggestion: 'Tente novamente em alguns instantes.' },
  422: { title: 'Dados inválidos', description: 'Os dados não puderam ser processados.', icon: 'fa-clipboard-check', suggestion: 'Verifique os campos obrigatórios.' },
  429: { title: 'Muitas requisições', description: 'Você fez muitas requisições em pouco tempo.', icon: 'fa-hourglass-half', suggestion: 'Aguarde alguns segundos e tente novamente.' },
  500: { title: 'Erro interno', description: 'Ocorreu um erro inesperado no servidor.', icon: 'fa-server', suggestion: 'Tente novamente. Se persistir, entre em contato.' },
  502: { title: 'Serviço indisponível', description: 'O servidor não está respondendo.', icon: 'fa-plug', suggestion: 'Tente em alguns minutos.' },
  503: { title: 'Em manutenção', description: 'O sistema está em manutenção temporária.', icon: 'fa-tools', suggestion: 'Volte em alguns minutos.' },
}
</script>

<template>
  <div>
    <Head>
      <Title>Erro {{ error?.statusCode || 500 }} - Sistema de Aposta</Title>
      <Link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    </Head>

    <NuxtLayout>
      <div class="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div class="text-center max-w-lg animate-fade-in">
          <div class="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <i :class="['fas', (errorMessages[error?.statusCode] || errorMessages[500]).icon, 'text-4xl text-red-500 dark:text-red-400']" aria-hidden="true"></i>
          </div>

          <h1 class="text-7xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">{{ error?.statusCode || 500 }}</h1>
          <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">{{ (errorMessages[error?.statusCode] || errorMessages[500]).title }}</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-2 text-sm leading-relaxed">{{ (errorMessages[error?.statusCode] || errorMessages[500]).description }}</p>
          <p class="text-gray-400 dark:text-gray-500 mb-8 text-xs">
            <i class="fas fa-lightbulb text-yellow-500 mr-1" aria-hidden="true"></i>
            {{ (errorMessages[error?.statusCode] || errorMessages[500]).suggestion }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <a href="/" class="btn-primary">
              <i class="fas fa-home mr-2" aria-hidden="true"></i> Página Inicial
            </a>
            <a href="javascript:history.back()" class="btn-secondary">
              <i class="fas fa-arrow-left mr-2" aria-hidden="true"></i> Voltar
            </a>
          </div>

          <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Talvez você queira acessar:</p>
            <div class="flex flex-wrap justify-center gap-3">
              <a href="/apostas" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">Apostas</a>
              <a href="/simulador" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">Simulador</a>
              <a href="/analisador" class="text-xs text-brand-600 dark:text-brand-400 hover:underline">Analisador</a>
            </div>
          </div>

          <p class="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Sistema desenvolvido pelo desenvolvedor <strong class="text-brand-600 dark:text-brand-400">HOTWYL</strong> | <strong class="text-brand-600 dark:text-brand-400">WILLFROMBRASIL</strong>
          </p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
