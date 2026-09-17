# Sistema de Aposta

Plataforma de análise e gestão inteligente de apostas em loterias brasileiras (Lotofácil e Lotomania).

## Stack Tecnológica

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS + Vite
- **Backend**: Nitro (server engine) + Drizzle ORM
- **Banco de Dados**: MariaDB 11
- **Cache / Jobs**: Redis (cache-aside de queries e fila de jobs)
- **IA**: 9Router (gateway OpenAI-compatible, 40+ provedores)
- **Validação**: Zod
- **Estado**: Pinia
- **Tabelas**: TanStack Table (paginação, filtro, ordenação)
- **SEO**: sitemap + robots + JSON-LD (Schema.org) + Open Graph / Twitter Cards
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
- **Geração assistida por IA** via 9Router (múltiplos jogos por request)
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
| Redis 7 | 6379 | Cache de queries e fila de jobs |
| phpMyAdmin | 8080 | Gerenciamento DB |
| 9Router | 20128 | Gateway de IA (OpenAI-compatible) |

## Início Rápido

```bash
# Clonar e configurar
cp .env.example .env
# Editar .env com sua NINEROUTER_API_KEY (gerada no dashboard do 9Router)

# Subir toda a stack
docker compose up --build -d

# Verificar status
docker compose ps

# Logs
docker compose logs -f
```

Após subir, valide a saúde da stack:

```bash
curl http://localhost:3000/api/admin/health
# { "status": "healthy", "checks": { "database": {...}, "cache": {...} } }
```

## Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DATABASE_URL=mysql://root:root@db:3306/sistema_aposta

# Redis (cache e jobs)
REDIS_URL=redis://redis:6379

# IA - 9Router (OpenAI-compatible)
NINEROUTER_URL=http://9router:20128
NINEROUTER_API_KEY=
NINEROUTER_MODEL=auto/best
```

> **Nota sobre desenvolvimento local:** quando a aplicação roda fora do Docker
> (`npm run dev`) e a infra sobe via `docker compose -f docker-compose.dev.yml up`,
> os hosts `db`, `redis` e `9router` não resolvem no host local. Nesse cenário use
> `localhost` no `.env` (ex.: `REDIS_URL=redis://localhost:6379`,
> `DATABASE_URL=mysql://root:root@localhost:3306/sistema_aposta`,
> `NINEROUTER_URL=http://localhost:20128`). Sem Redis, o cache degrada
> graciosamente para a origem (o app continua funcionando).

### 9Router

1. Acesse http://localhost:20128 (dashboard)
2. Configure provedores (Groq, Mistral, OpenAI, etc.) com suas API keys
3. Gere uma API key e coloque em `NINEROUTER_API_KEY` no `.env`
4. O modelo `auto/best` roteia automaticamente para o melhor provedor disponível

## Acessos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Aplicação | http://localhost:3000 | — |
| phpMyAdmin | http://localhost:8080 | root / root |
| 9Router | http://localhost:20128 | Definidas no primeiro acesso |

## Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento local
npm run build            # Build produção
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Vitest (unit)
npm run test:e2e         # Playwright (e2e)
npm run docker:dev       # Sobe infra dev (DB + Redis + phpMyAdmin + 9Router)
npm run docker:prod      # Sobe stack produção completa
npm run docker:logs      # Logs dos containers
npm run docker:reset     # Reset total (remove volumes)
```

## Cache e Jobs (Redis)

- **Cache-aside** aplicado às queries pesadas (estatísticas, análise completa,
  conjunto de sorteios). Chaves são invalidadas ao importar concursos.
- **Fila de jobs** leve (`server/utils/queue.ts`) para rastrear tarefas
  assíncronas (ex.: geração por IA) sem manter a requisição HTTP aberta.
- O storage Redis é montado em **runtime** por `server/plugins/storage.ts`
  (lê `REDIS_URL`), com degradação graciosa se o Redis estiver indisponível.

## SEO / GEO / AEO

- `sitemap.xml` e `robots.txt` gerados automaticamente (`/api/**` bloqueado).
- Metadados por página via `composables/useSeo.ts`: título, descrição,
  Open Graph, Twitter Card, canonical e dados estruturados JSON-LD (Schema.org).

## Segurança

- Headers HTTP via nuxt-security (CSP com nonce, HSTS, X-Frame-Options,
  Referrer-Policy, Permissions-Policy)
- Rate limiting
- Validação de entrada com Zod
- Sanitização e limite de tamanho de payload
- Docker com `no-new-privileges` e usuário não-root
- 9Router com autenticação Bearer Token
- `autocomplete="off"` em todos os formulários

## Conformidade de Privacidade

Em conformidade com as principais normas globais:

- **LGPD** (Brasil, Lei nº 13.709/2018)
- **GDPR** (União Europeia)
- **CCPA** (Califórnia, EUA)
- **POPIA** (África do Sul)

Recursos: banner de consentimento, Política de Privacidade e Termos de Uso,
sem coleta de dados pessoais identificáveis, apenas localStorage para
preferências, sem cookies de rastreamento.

## Estrutura do Projeto

```
├── components/          # Componentes Vue (DataTable, Header, Footer, etc.)
├── composables/         # useSeo, useAlert (SweetAlert2)
├── pages/               # Páginas (index, apostas, concursos, simulador, analisador, importador)
├── server/
│   ├── api/             # Endpoints REST
│   ├── database/        # Schema Drizzle + conexão MariaDB
│   ├── middleware/      # Sanitização de payload
│   ├── plugins/         # Montagem do storage Redis em runtime
│   ├── services/        # Lógica de negócio (IA, simulador, analisador)
│   └── utils/           # Cache, fila de jobs, validadores, error handlers
├── docker/
│   ├── Dockerfile       # Build multi-stage Node.js
│   └── init-db.sql      # Schema inicial MariaDB
├── docker-compose.yml   # Stack produção
├── docker-compose.dev.yml # Stack desenvolvimento
├── nuxt.config.ts       # Configuração Nuxt + módulos
└── .env                 # Variáveis de ambiente
```

## Desenvolvedor

Sistema desenvolvido pelo desenvolvedor **HOTWYL | WILLFROMBRASIL**

---

*Jogue com responsabilidade. Apostas são entretenimento, não fonte de renda.*
