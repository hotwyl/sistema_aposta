<script setup lang="ts">
useSeo({ title: 'Sobre', path: '/sobre', description: 'Conheça o Sistema de Aposta: plataforma de análise estatística de loterias brasileiras.' })
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
    <AppBreadcrumb :items="[{ label: 'Sobre' }]" />

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-6">
      <i class="fas fa-info-circle text-brand-600 mr-2"></i> Sobre o Sistema
    </h1>

    <div class="card p-6 space-y-6">
      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">O que é</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          O <strong>Sistema de Aposta</strong> é uma plataforma gratuita para análise e gestão de apostas em loterias brasileiras (Lotofácil e Lotomania). Desenvolvida com tecnologias modernas, oferece ferramentas de análise estatística, simulação de números, conferência de resultados e importação de dados históricos.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Funcionalidades</h2>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li><i class="fas fa-check text-green-500 mr-2"></i> Registro e gestão de apostas</li>
          <li><i class="fas fa-check text-green-500 mr-2"></i> Simulador de números (aleatório e por frequência)</li>
          <li><i class="fas fa-check text-green-500 mr-2"></i> Análise estatística de frequências e atrasos</li>
          <li><i class="fas fa-check text-green-500 mr-2"></i> Conferência de resultados</li>
          <li><i class="fas fa-check text-green-500 mr-2"></i> Importação de dados via CSV</li>
          <li><i class="fas fa-check text-green-500 mr-2"></i> Interface responsiva e acessível</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tecnologias</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Nuxt 3 + Nitro + TypeScript + Tailwind CSS + MariaDB 11 + Drizzle ORM + Redis + Pinia + Zod + Docker,
          com IA via gateway 9Router.
        </p>
      </section>

      <section class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Sistema desenvolvido pelo desenvolvedor <strong class="text-brand-600">HOTWYL</strong> | <strong class="text-brand-600">WILLFROMBRASIL</strong>
        </p>
      </section>
    </div>
  </div>
</template>
