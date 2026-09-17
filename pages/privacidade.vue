<script setup lang="ts">
useSeo({
  title: 'Política de Privacidade',
  path: '/privacidade',
  description: 'Política de Privacidade do Sistema de Aposta em conformidade com LGPD, GDPR, CCPA e POPIA.',
})
</script>

<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
    <AppBreadcrumb :items="[{ label: 'Política de Privacidade' }]" />

    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-6">
      <i class="fas fa-shield-alt text-brand-600 mr-2" aria-hidden="true"></i> Política de Privacidade
    </h1>

    <div class="card p-6 sm:p-8 prose prose-sm dark:prose-invert max-w-none">
      <div class="flex items-center gap-2 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100 dark:border-brand-800/30 mb-6">
        <i class="fas fa-gavel text-brand-600 text-sm" aria-hidden="true"></i>
        <p class="text-xs text-brand-700 dark:text-brand-300 m-0">
          Em conformidade com as principais normas de privacidade:
          <strong>LGPD</strong> (Brasil, Lei nº 13.709/2018), <strong>GDPR</strong> (União Europeia),
          <strong>CCPA</strong> (Califórnia, EUA) e <strong>POPIA</strong> (África do Sul).
        </p>
      </div>

      <p class="text-sm text-gray-500 mb-6">Última atualização: Julho de 2026</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">1. Controlador dos Dados</h2>
      <p>O controlador dos dados pessoais tratados por este sistema é o desenvolvedor <strong>HOTWYL | WILLFROMBRASIL</strong>, responsável pelas decisões referentes ao tratamento de dados pessoais.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">2. Dados Coletados</h2>
      <p>O Sistema de Aposta é uma aplicação <strong>pública sem autenticação</strong>. Coletamos e armazenamos apenas:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li><strong>Dados de apostas</strong>: números escolhidos, tipo de loteria, valor, data, observações — inseridos voluntariamente pelo usuário.</li>
        <li><strong>Dados de concursos</strong>: resultados oficiais importados de fontes públicas (Caixa Econômica Federal).</li>
        <li><strong>Preferência de tema</strong>: claro/escuro — armazenado localmente no navegador (localStorage).</li>
        <li><strong>Consentimento LGPD</strong>: registro de aceite/rejeição — armazenado localmente no navegador.</li>
      </ul>
      <p class="mt-3"><strong>Não coletamos:</strong> nome, e-mail, CPF, endereço IP (para rastreamento), localização, dados de navegação, cookies de rastreamento ou qualquer dado pessoal identificável.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">3. Finalidade do Tratamento</h2>
      <p>Os dados de apostas são utilizados exclusivamente para:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Análise estatística de frequências e padrões</li>
        <li>Conferência de resultados contra concursos oficiais</li>
        <li>Simulação e geração de combinações numéricas</li>
        <li>Gestão e organização das apostas do usuário</li>
      </ul>

      <h2 class="text-lg font-semibold mt-8 mb-3">4. Base Legal (Art. 7º da LGPD)</h2>
      <p>O tratamento de dados neste sistema fundamenta-se nas seguintes bases legais:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li><strong>Consentimento (Art. 7º, I)</strong>: o usuário consente ao inserir dados voluntariamente e aceitar esta política.</li>
        <li><strong>Legítimo interesse (Art. 7º, IX)</strong>: para funcionamento das ferramentas de análise e estatísticas.</li>
      </ul>

      <h2 class="text-lg font-semibold mt-8 mb-3">5. Compartilhamento de Dados</h2>
      <p><strong>Não compartilhamos dados com terceiros.</strong> Os dados permanecem exclusivamente no banco de dados do sistema e não são transferidos, vendidos ou disponibilizados a nenhuma entidade externa.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">6. Armazenamento e Segurança</h2>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li>Dados armazenados em banco de dados MariaDB com conexão segura</li>
        <li>Headers de segurança HTTP (CSP, HSTS, X-Frame-Options)</li>
        <li>Rate limiting para proteção contra abuso</li>
        <li>Validação e sanitização de todas as entradas</li>
        <li>Containers Docker com isolamento de rede</li>
        <li>Execução com usuário não-root e permissões restritas</li>
      </ul>

      <h2 class="text-lg font-semibold mt-8 mb-3">7. Cookies e Tecnologias de Rastreamento</h2>
      <p><strong>Este sistema NÃO utiliza cookies.</strong> Utilizamos apenas o localStorage do navegador para:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li><code>darkMode</code>: preferência de tema visual (true/false)</li>
        <li><code>lgpd_consent</code>: registro de aceite/rejeição da política (accepted/rejected)</li>
        <li><code>lgpd_consent_date</code>: data do aceite/rejeição</li>
      </ul>
      <p class="mt-2">Esses dados ficam <strong>exclusivamente no seu navegador</strong> e não são enviados ao servidor.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">8. Direitos do Titular (Art. 18 da LGPD)</h2>
      <p>Você tem direito a:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li><strong>Acesso</strong>: visualizar todos os dados armazenados (disponível na interface do sistema)</li>
        <li><strong>Correção</strong>: editar dados incorretos (disponível via funcionalidade de edição)</li>
        <li><strong>Exclusão</strong>: remover seus dados a qualquer momento (disponível via botão excluir)</li>
        <li><strong>Revogação do consentimento</strong>: limpar localStorage no navegador</li>
        <li><strong>Informação sobre compartilhamento</strong>: não compartilhamos dados com terceiros</li>
        <li><strong>Portabilidade</strong>: os dados podem ser exportados via interface</li>
      </ul>

      <div class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
        <p class="text-sm text-green-700 dark:text-green-300 m-0">
          <i class="fas fa-info-circle mr-1" aria-hidden="true"></i>
          <strong>Como exercer seus direitos:</strong> Use as funcionalidades de edição e exclusão diretamente na interface do sistema.
        </p>
      </div>

      <h2 class="text-lg font-semibold mt-8 mb-3">9. Retenção de Dados</h2>
      <p>Os dados permanecem armazenados enquanto o usuário não solicitar exclusão. Não há prazo automático de expiração. O usuário pode excluir individualmente apostas e concursos a qualquer momento.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">10. Transferência Internacional</h2>
      <p>Os dados são armazenados em servidores localizados no Brasil. Não há transferência internacional de dados.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">11. Menores de Idade</h2>
      <p>Este sistema não é destinado a menores de 18 anos. Não coletamos dados de menores de idade conscientemente.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">12. Alterações nesta Política</h2>
      <p>Esta política pode ser atualizada periodicamente. A data de última atualização será sempre informada no topo desta página. O uso continuado após alterações constitui aceitação da nova versão.</p>

      <h2 class="text-lg font-semibold mt-8 mb-3">13. Contato do Encarregado (DPO)</h2>
      <p>Para questões sobre privacidade, proteção de dados ou exercício de direitos previstos na LGPD:</p>
      <ul class="list-disc list-inside space-y-1 ml-4">
        <li><strong>Responsável</strong>: HOTWYL | WILLFROMBRASIL</li>
        <li><strong>E-mail</strong>: <a href="mailto:contato@3wonline.com.br" class="text-brand-600 dark:text-brand-400">contato@3wonline.com.br</a></li>
        <li><strong>WhatsApp</strong>: <a href="https://wa.me/5541996924829" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-400">(41) 99692-4829</a></li>
      </ul>

      <h2 class="text-lg font-semibold mt-8 mb-3">14. Autoridade Nacional de Proteção de Dados</h2>
      <p>Caso entenda que o tratamento de dados está em desacordo com a legislação, o titular pode apresentar reclamação perante a Autoridade Nacional de Proteção de Dados (ANPD).</p>
      <p><strong>Site</strong>: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-400">www.gov.br/anpd</a></p>
    </div>
  </div>
</template>
