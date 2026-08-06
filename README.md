# Sistema de Aposta

Plataforma de análise e gestão inteligente de apostas em loterias brasileiras (Lotofácil e Lotomania).

## Stack Tecnológica

- **Frontend**: Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS + Vite
- **Backend**: Nitro (server engine) + Drizzle ORM
- **Banco de Dados**: MariaDB 11
- **IA**: OmniRoute (gateway multi-provider — 500+ modelos)
- **Validação**: Zod
- **Estado**: Pinia
- **Tabelas**: TanStack Table (paginação, filtro, ordenação)
- **Infraestrutura**: Docker + Docker Compose
- **Gerenciamento DB**: phpMyAdmin
- **UI/UX**: Font Awesome 6 + SweetAlert2 + Dark Mode + Mobile First

## Funcionalidades

### Gestão de Apostas
- CRUD completo (criar, visualizar, editar, excluir)
- Marcar como favoritas
- Filtros por tipo de loteria
- Estatísticas detalhadas por aposta (métricas, premiações, histórico)
- Ranking de apostas com comparação contra concursos

### Simulador de Números
- Geração aleatória
- Geração por frequência histórica
- **Estratégia Alta Precisão** (multi-critério: frequência + atrasos + par/ímpar + faixas + repetições)
- **Geração assistida por IA** via OmniRoute (múltiplos jogos por request)
- Configuração de quantidade de jogos (1-20)

### Analisador Estatístico
- Painel de estatísticas (apostas, concursos, premiações, taxa)
- Frequência de cada número (mais e menos sorteados)
- Números em atraso
- Distribuição par/ímpar
- Repetições entre concursos consecutivos
- **Conferência de resultados** (confira números contra sorteios)
- **Análise com IA** (insights e recomendações)

### Importador de Dados
- Importação de concursos via CSV/XLS/XLSX
- Importação de apostas via arquivo
- Detecção automática de formato e colunas
- Validação de duplicatas

## Infraestrutura Docker

| Container | Porta | Função |
|-----------|-------|--------|
| App (Nuxt/Nitro) | 3000 | Aplicação principal |
| MariaDB 11 | 3306 | Banco de dados |
| phpMyAdmin | 8080 | Gerenciamento DB |
| OmniRoute | 20128 | Gateway IA |

## Início Rápido

```bash
# Clonar e configurar
cp .env.example .env
# Editar .env com sua OMNIROUTER_API_KEY

# Subir toda a stack
docker compose up --build -d

# Verificar status
docker compose ps

# Logs
docker compose logs -f
```

## Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DATABASE_URL=mysql://root:root@db:3306/sistema_aposta

# IA - OmniRoute
OMNIROUTER_URL=http://omniroute:3000
OMNIROUTER_API_KEY=sua-chave-aqui
OMNIROUTER_MODEL=auto/best-coding
```

### OmniRoute

1. Acesse http://localhost:20128 (dashboard)
2. Configure providers (Groq, Mistral, etc.) com suas API keys
3. Gere uma API key e coloque no `.env`
4. O modelo `auto/best-coding` roteia automaticamente para o melhor provider disponível

## Acessos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Aplicação | http://localhost:3000 | — |
| phpMyAdmin | http://localhost:8080 | root / root |
| OmniRoute | http://localhost:20128 | CHANGEME (alterar) |

## Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento local
npm run build            # Build produção
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Vitest (unit)
npm run test:e2e         # Playwright (e2e)
npm run docker:dev       # Sobe infra dev (DB + phpMyAdmin + OmniRoute)
npm run docker:prod      # Sobe stack produção completa
npm run docker:logs      # Logs dos containers
npm run docker:reset     # Reset total (remove volumes)
```

## Segurança

- Headers HTTP (CSP, X-Frame-Options, CORP, COOP)
- Rate limiting via nuxt-security
- Validação de entrada com Zod
- Sanitização de payload
- Docker com `no-new-privileges`, usuário não-root
- OmniRoute com autenticação Bearer Token
- `autocomplete="off"` em todos os formulários

## Conformidade LGPD

- Banner de consentimento
- Política de Privacidade e Termos de Uso
- Sem coleta de dados pessoais identificáveis
- Apenas localStorage para preferência de tema
- Sem cookies de rastreamento

## Estrutura do Projeto

```
├── components/          # Componentes Vue (DataTable, Header, Footer, etc.)
├── pages/               # Páginas (index, apostas, concursos, simulador, analisador, importador)
├── server/
│   ├── api/             # Endpoints REST
│   ├── database/        # Schema Drizzle + conexão MariaDB
│   ├── services/        # Lógica de negócio (IA, simulador, analisador)
│   └── utils/           # Validadores, error handlers
├── docker/
│   ├── Dockerfile       # Build multi-stage Node.js
│   └── init-db.sql      # Schema inicial MariaDB
├── docker-compose.yml   # Stack produção
├── docker-compose.dev.yml # Stack desenvolvimento
├── nuxt.config.ts       # Configuração Nuxt + módulos
└── .env                 # Variáveis de ambiente
```

## Desenvolvedor

Sistema desenvolvido por **HOTWYL | WILLFROMBRASIL**

---

*Jogue com responsabilidade. Apostas são entretenimento, não fonte de renda.*
