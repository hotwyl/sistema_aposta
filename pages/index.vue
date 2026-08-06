<script setup lang="ts">
useHead({
  title: 'Sistema de Aposta - Análise Inteligente de Loterias',
  meta: [
    { name: 'description', content: 'Plataforma inteligente para análise e gestão de apostas em loterias brasileiras. Lotofácil e Lotomania com estatísticas, simulador e conferência.' },
  ],
})

const beneficios = [
  { icon: 'fa-chart-line', color: 'brand', title: 'Análise Estatística', desc: 'Visualize padrões, frequências e tendências dos números sorteados com dados completos.' },
  { icon: 'fa-robot', color: 'green', title: 'Simulador Inteligente', desc: 'Gere combinações usando algoritmos aleatórios ou baseados em frequência histórica.' },
  { icon: 'fa-shield-alt', color: 'purple', title: 'Segurança Total', desc: 'Aplicação protegida com headers de segurança, LGPD e boas práticas de desenvolvimento.' },
  { icon: 'fa-file-import', color: 'yellow', title: 'Importação de Dados', desc: 'Importe resultados históricos via CSV para análises completas e conferências.' },
  { icon: 'fa-heart', color: 'red', title: 'Apostas Favoritas', desc: 'Salve suas combinações preferidas e organize suas apostas facilmente.' },
  { icon: 'fa-mobile-alt', color: 'blue', title: 'Mobile First', desc: 'Acesse de qualquer dispositivo. Interface responsiva e otimizada para celulares.' },
]

const colorMap: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand-50 dark:bg-brand-900/30', text: 'text-brand-600 dark:text-brand-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
}

const servicos = [
  { icon: 'fa-ticket-alt', color: 'brand', title: 'Gestão de Apostas', desc: 'Cadastre, organize e acompanhe todas as suas apostas. Marque favoritas e filtre por loteria.', dica: 'Use favoritas para reutilizar combinações que você confia.' },
  { icon: 'fa-chart-bar', color: 'green', title: 'Análise Estatística', desc: 'Frequências, atrasos e padrões. Identifique os números mais e menos sorteados com dados reais.', dica: 'Combine números frequentes com números em atraso.' },
  { icon: 'fa-dice', color: 'purple', title: 'Simulador de Números', desc: 'Gere combinações com estratégias estatísticas avançadas ou com auxílio de Inteligência Artificial.', dica: 'Gere vários jogos e compare no ranking.' },
  { icon: 'fa-file-import', color: 'yellow', title: 'Importação de Dados', desc: 'Importe resultados históricos via CSV/XLS. Mantenha sua base sempre atualizada.', dica: 'Baixe os resultados no site da Caixa e importe aqui.' },
  { icon: 'fa-check-double', color: 'blue', title: 'Conferência de Resultados', desc: 'Confira seus números contra sorteios oficiais. Veja acertos e faixa de premiação.', dica: 'Acesse pelo Analisador para conferir com dados já carregados.' },
  { icon: 'fa-clock', color: 'orange', title: 'Números em Atraso', desc: 'Identifique números que estão há mais tempo sem serem sorteados.', dica: 'Use como complemento na sua estratégia de apostas.' },
]

const dicas = [
  'Diversifique suas apostas entre diferentes estratégias e combinações.',
  'Analise os números mais frequentes e os que estão em atraso.',
  'Defina um orçamento mensal e não ultrapasse esse limite.',
  'Use o simulador para testar combinações antes de apostar de verdade.',
]

const ferramentas = [
  {
    gradient: 'from-green-500 to-emerald-600',
    icon: 'fa-dice',
    title: 'Simulador',
    subtitle: 'Geração inteligente de números',
    desc: 'Gere combinações de números usando diferentes estratégias: aleatória ou baseada em frequência histórica dos sorteios.',
    stepsTitle: 'Como usar:',
    steps: ['Escolha o tipo de loteria', 'Selecione a estratégia desejada', 'Defina a quantidade de jogos', 'Clique em "Gerar" e analise os resultados'],
    route: '/simulador',
    linkColor: 'text-green-600 dark:text-green-400',
  },
  {
    gradient: 'from-blue-500 to-brand-600',
    icon: 'fa-chart-pie',
    title: 'Analisador',
    subtitle: 'Estatísticas detalhadas',
    desc: 'Analise resultados históricos com estatísticas completas. Veja frequências, números em atraso e identifique padrões.',
    stepsTitle: 'Recursos:',
    steps: ['Frequência de cada número', 'Números em atraso', 'Top 10 mais e menos sorteados', 'Dados atualizados'],
    route: '/analisador',
    linkColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    gradient: 'from-yellow-500 to-orange-600',
    icon: 'fa-file-import',
    title: 'Importador',
    subtitle: 'Importação em massa',
    desc: 'Importe resultados de concursos via arquivo CSV. Mantenha sua base de dados atualizada com os últimos sorteios.',
    stepsTitle: 'Formatos aceitos:',
    steps: ['CSV (.csv)', 'Separação por vírgula ou ponto-e-vírgula', 'Até 10MB por arquivo'],
    route: '/importador',
    linkColor: 'text-yellow-600 dark:text-yellow-400',
  },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative px-4 sm:px-6 lg:px-8 py-20 md:py-28 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 text-7xl animate-bounce-subtle"><i class="fas fa-clover"></i></div>
        <div class="absolute top-20 right-20 text-5xl animate-bounce-subtle" style="animation-delay: 0.5s"><i class="fas fa-dice"></i></div>
        <div class="absolute bottom-10 left-1/3 text-6xl animate-bounce-subtle" style="animation-delay: 1s"><i class="fas fa-star"></i></div>
      </div>

      <div class="relative max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 mb-6 border border-white/20">
          <i class="fas fa-sparkles mr-2 text-accent-400"></i> Plataforma de Análise de Loterias
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
          Aposte com <span class="text-accent-300">Inteligência</span>
        </h1>
        <p class="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Análise estatística, simulador e gestão completa das suas apostas em Lotofácil e Lotomania. Transforme dados em estratégia.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/apostas" class="btn-accent text-base px-8 py-4">
            <i class="fas fa-rocket mr-2"></i> Começar Agora
          </NuxtLink>
          <NuxtLink to="/simulador" class="btn-ghost text-base px-8 py-4">
            <i class="fas fa-dice mr-2"></i> Simulador
          </NuxtLink>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/60">
          <span class="flex items-center"><i class="fas fa-shield-alt mr-1.5 text-green-400"></i> Dados protegidos</span>
          <span class="flex items-center"><i class="fas fa-bolt mr-1.5 text-accent-400"></i> Análise em tempo real</span>
          <span class="flex items-center"><i class="fas fa-mobile-alt mr-1.5 text-blue-400"></i> 100% responsivo</span>
        </div>
      </div>
    </section>

    <!-- Benefícios -->
    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="section-heading">Por que usar o Sistema de Aposta?</h2>
        <p class="section-subheading mx-auto">Ferramentas para quem leva apostas a sério</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in beneficios"
          :key="item.title"
          class="card p-6 hover-lift group"
        >
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110', colorMap[item.color]?.bg]">
            <i :class="['fas', item.icon, 'text-xl', colorMap[item.color]?.text]"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Como Funciona -->
    <section class="py-16 md:py-20 bg-gray-100 dark:bg-gray-800/30 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="section-heading">Como Funciona</h2>
          <p class="section-subheading mx-auto">Em 3 passos simples você começa a usar</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(step, i) in ['Registre Apostas', 'Analise Dados', 'Confira Resultados']" :key="i" class="text-center group">
            <div class="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-lg group-hover:scale-105 transform transition-transform">
              {{ i + 1 }}
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{{ step }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ i === 0 ? 'Cadastre suas apostas e organize por tipo de loteria.' : i === 1 ? 'Use as ferramentas de análise para entender padrões.' : 'Confira seus números contra os resultados oficiais.' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Serviços -->
    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="section-heading"><i class="fas fa-concierge-bell text-brand-500 mr-2"></i> Nossos Serviços</h2>
        <p class="section-subheading mx-auto">Tudo gratuito, sem cadastro. Acesse direto pelo menu.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="servico in servicos" :key="servico.title" class="card p-5 hover-lift">
          <div class="flex items-center mb-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mr-3', colorMap[servico.color]?.bg]">
              <i :class="['fas', servico.icon, 'text-lg', colorMap[servico.color]?.text]"></i>
            </div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ servico.title }}</h3>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{{ servico.desc }}</p>
          <p class="text-xs text-brand-600 dark:text-brand-400"><i class="fas fa-lightbulb mr-1"></i> {{ servico.dica }}</p>
        </div>
      </div>
    </section>

    <!-- Dicas -->
    <section class="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="section-heading">
          <i class="fas fa-lightbulb text-accent-500 mr-2"></i> Dicas para Apostadores
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(dica, i) in dicas" :key="i" class="flex items-start space-x-3 p-4 card group">
          <div class="flex-shrink-0 w-6 h-6 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
            <i class="fas fa-check text-green-600 dark:text-green-400 text-xs"></i>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ dica }}</p>
        </div>
      </div>
    </section>
  </div>
    <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in">

    <div class="text-center mt-6 mb-10">
      <h1 class="section-heading">
        <i class="fas fa-tools text-brand-600 dark:text-brand-400 mr-2" aria-hidden="true"></i> Ferramentas
      </h1>
      <p class="section-subheading mx-auto">
        Conheça as ferramentas disponíveis para potencializar suas apostas. Cada uma foi projetada para um objetivo específico.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <div v-for="tool in ferramentas" :key="tool.title" class="card overflow-hidden hover-lift">
        <div :class="['bg-gradient-to-r p-6 text-white', tool.gradient]">
          <i :class="['fas', tool.icon, 'text-3xl mb-3 opacity-90']" aria-hidden="true"></i>
          <h3 class="text-xl font-bold">{{ tool.title }}</h3>
          <p class="text-sm text-white/70 mt-1">{{ tool.subtitle }}</p>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{{ tool.desc }}</p>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{{ tool.stepsTitle }}</h4>
          <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-5">
            <li v-for="step in tool.steps" :key="step" class="flex items-center">
              <i class="fas fa-check text-green-600 dark:text-green-400 mr-2 text-[10px]" aria-hidden="true"></i>{{ step }}
            </li>
          </ul>
          <NuxtLink :to="tool.route" :class="['inline-flex items-center text-sm font-medium hover:underline transition-colors', tool.linkColor]">
            <i class="fas fa-arrow-right mr-1.5 text-xs" aria-hidden="true"></i> Acessar {{ tool.title }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <TipCard variant="purple">
      Combine as ferramentas: use o <NuxtLink to="/importador" class="underline font-medium">Importador</NuxtLink> para carregar dados, o <NuxtLink to="/analisador" class="underline font-medium">Analisador</NuxtLink> para identificar padrões e o <NuxtLink to="/simulador" class="underline font-medium">Simulador</NuxtLink> para gerar jogos estratégicos.
    </TipCard>
  </div>
</template>
