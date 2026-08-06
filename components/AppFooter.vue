<template>
  <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto" role="contentinfo">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center">
              <i class="fas fa-clover text-white text-xs" aria-hidden="true"></i>
            </div>
            <span class="font-bold text-gray-900 dark:text-white">Sistema de Aposta</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Plataforma de análise e gestão inteligente de apostas em loterias brasileiras. Lotofácil e Lotomania.
          </p>
        </div>

        <!-- Links -->
        <nav aria-label="Links do rodapé">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Navegação</h3>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/apostas" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Apostas</NuxtLink></li>
            <li><NuxtLink to="/simulador" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Simulador</NuxtLink></li>
            <li><NuxtLink to="/analisador" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Analisador</NuxtLink></li>
            <li><NuxtLink to="/importador" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Importador</NuxtLink></li>
          </ul>
        </nav>

        <!-- Legal & LGPD -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legal</h3>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/termos" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Termos de Uso</NuxtLink></li>
            <li><NuxtLink to="/privacidade" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Política de Privacidade</NuxtLink></li>
            <li><NuxtLink to="/sobre" class="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Sobre</NuxtLink></li>
          </ul>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-4">
            <i class="fas fa-shield-alt mr-1" aria-hidden="true"></i> Em conformidade com a LGPD (Lei nº 13.709/2018)
          </p>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © {{ new Date().getFullYear() }} Sistema de Aposta. Todos os direitos reservados.
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
          Sistema desenvolvido pelo desenvolvedor <strong class="text-brand-600 dark:text-brand-400">HOTWYL</strong> | <strong class="text-brand-600 dark:text-brand-400">WILLFROMBRASIL</strong>
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
          <i class="fas fa-exclamation-triangle mr-1 text-yellow-500" aria-hidden="true"></i>
          Jogue com responsabilidade. Apostas são entretenimento, não fonte de renda.
        </p>
      </div>
    </div>
  </footer>
</template>
