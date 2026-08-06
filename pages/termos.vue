<script setup lang="ts">
useHead({
  title: 'Termos de Uso - Sistema de Aposta',
  meta: [
    { name: 'description', content: 'Termos de Uso do Sistema de Aposta. Condições de utilização da plataforma.' },
  ],
})
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Termos de Uso' }]" />

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-6">
      <i class="fas fa-file-contract text-brand-600 mr-2" aria-hidden="true"></i> Termos de Uso
    </h1>

    <div class="card p-6 sm:p-8 prose prose-sm dark:prose-invert max-w-none">
      <p class="text-sm text-gray-500 mb-6">Última atualização: Julho de 2026</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">1. Aceitação dos Termos</h2>
      <p>Ao acessar e utilizar o Sistema de Aposta, você declara ter lido, compreendido e concordado com estes Termos de Uso e com a <NuxtLink to="/privacidade" class="text-brand-600 dark:text-brand-400 underline">Política de Privacidade</NuxtLink>. O uso é livre e gratuito.</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">2. Descrição do Serviço</h2>
      <p>O Sistema de Aposta é uma ferramenta de análise estatística e gestão de apostas em loterias brasileiras (Lotofácil e Lotomania). O sistema oferece:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Registro e organização de apostas</li>
        <li>Simulação de combinações numéricas</li>
        <li>Análise de frequências e atrasos</li>
        <li>Conferência de resultados</li>
        <li>Importação de dados históricos</li>
        <li>Geração assistida por inteligência artificial (quando configurada)</li>
      </ul>

      <h2 class="text-lg font-semibold mt-6 mb-3">3. Isenção de Responsabilidade</h2>
      <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
        <p class="text-sm text-yellow-700 dark:text-yellow-300 m-0">
          <i class="fas fa-exclamation-triangle mr-1" aria-hidden="true"></i>
          <strong>IMPORTANTE:</strong> O sistema é fornecido "como está" (as is). As análises estatísticas e sugestões da IA são meramente informativas e <strong>não constituem garantia de premiação</strong>.
        </p>
      </div>
      <p class="mt-3">A responsabilidade pelas apostas realizadas é exclusivamente do usuário. Não realizamos apostas em nome do usuário nem intermediamos transações financeiras.</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">4. Jogo Responsável</h2>
      <p>Apostar deve ser encarado como entretenimento. Recomendamos:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Defina um orçamento mensal e não o ultrapasse</li>
        <li>Nunca aposte dinheiro que não pode perder</li>
        <li>Não tente recuperar perdas aumentando apostas</li>
        <li>Se perceber que o jogo está afetando sua vida, busque ajuda</li>
      </ul>

      <h2 class="text-lg font-semibold mt-6 mb-3">5. Uso Adequado</h2>
      <p>O usuário compromete-se a:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Utilizar o sistema de forma ética e legal</li>
        <li>Não tentar explorar vulnerabilidades ou realizar ataques</li>
        <li>Não automatizar requisições de forma abusiva</li>
        <li>Não inserir conteúdo ofensivo nas observações</li>
      </ul>

      <h2 class="text-lg font-semibold mt-6 mb-3">6. Propriedade Intelectual</h2>
      <p>O código-fonte, design, interface e funcionalidades do Sistema de Aposta são de propriedade do desenvolvedor HOTWYL | WILLFROMBRASIL. Os dados estatísticos de loterias são de domínio público (Caixa Econômica Federal).</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">7. Disponibilidade</h2>
      <p>Não garantimos disponibilidade ininterrupta do sistema. Manutenções, atualizações e eventuais indisponibilidades podem ocorrer sem aviso prévio.</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">8. Proteção de Dados (LGPD)</h2>
      <p>O tratamento de dados está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Para detalhes completos sobre como seus dados são tratados, consulte nossa <NuxtLink to="/privacidade" class="text-brand-600 dark:text-brand-400 underline">Política de Privacidade</NuxtLink>.</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">9. Limitação de Responsabilidade</h2>
      <p>Em nenhuma hipótese o desenvolvedor será responsável por:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Perdas financeiras decorrentes de apostas</li>
        <li>Decisões tomadas com base nas análises do sistema</li>
        <li>Indisponibilidade temporária do serviço</li>
        <li>Perda de dados por caso fortuito ou força maior</li>
      </ul>

      <h2 class="text-lg font-semibold mt-6 mb-3">10. Alterações nos Termos</h2>
      <p>Estes termos podem ser atualizados periodicamente. A data de última atualização é sempre informada no topo desta página. O uso continuado do sistema após alterações constitui aceitação automática dos novos termos.</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">11. Legislação Aplicável</h2>
      <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de Curitiba/PR para dirimir eventuais controvérsias.</p>

      <h2 class="text-lg font-semibold mt-6 mb-3">12. Contato</h2>
      <p>Para dúvidas sobre estes termos, entre em contato pelo e-mail do desenvolvedor.</p>
    </div>
  </div>
</template>
