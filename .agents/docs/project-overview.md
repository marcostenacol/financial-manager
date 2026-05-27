# Visão Geral do Projeto — Sistema Financeiro

## Descrição

Sistema de gerenciamento financeiro pessoal e empresarial construído como **API REST** com Node.js 20 + TypeScript 5 + Fastify 4. Permite controle de carteiras, transações, categorias, recorrências e geração de relatórios com dashboard.

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Runtime | Node.js 20 LTS | Estável, LTS, alta performance |
| Linguagem | TypeScript 5 | Tipagem estrita, melhor DX |
| Framework | Fastify 4 | ~3x mais rápido que Express, suporte nativo a TypeScript |
| ORM | Prisma 5 | Melhor integração TypeScript, migrations automáticas |
| Banco | PostgreSQL 16 | ACID, CTEs, Decimal nativo |
| Cache | Redis 7 | Cache de listagens + tokens JWT |
| Auth | JWT | Access token (15min) + Refresh token (7d) |
| DI | tsyringe | Injeção de dependência decorators |
| Jobs | node-cron | Processamento de recorrências |
| Testes | Vitest + Supertest | Rápido, moderno, integrado |
| Docs | fastify-swagger | Geração automática via schema |
| Container | Docker | Ambiente reproduzível |

---

## Módulos do Sistema

| Módulo | Domínio | Funcionalidades Principais |
|--------|---------|--------------------------|
| `auth` | Autenticação | Register, Login, Logout, Refresh Token |
| `profile` | Perfil | Detalhar, Atualizar, Avatar, Trocar Tipo |
| `wallet` | Carteiras | CRUD completo + Soft Delete |
| `transaction` | Transações | CRUD + Transfer + Filtros + Paginação |
| `category` | Categorias | CRUD + Categorias do sistema (globais) |
| `recurrence` | Recorrências | CRUD + Job de processamento automático |
| `report` | Relatórios | Resumo de Saldo, Gastos por Categoria, Evolução Mensal |

---

## Arquitetura em Camadas

```
Route → Controller → Service → Repository → Prisma/SQL
           ↓                        ↓
          DTO                     Cache
         (Zod)                   (Redis)
```

---

## Princípios Arquiteturais

1. **Isolamento de Módulos**: Cada domínio em `src/modules/{modulo}/` — sem acoplamento entre módulos.
2. **Cache Obrigatório**: Toda listagem usa Redis antes de consultar o banco.
3. **CTEs para Relatórios**: Módulo `report/` usa exclusivamente CTEs PostgreSQL.
4. **DI via tsyringe**: Todo acoplamento via interface + container.
5. **Resposta Padronizada**: `{ success, message, data }` via `Response.ts`.
6. **Schema First**: Toda mudança começa no `prisma/schema.prisma`.

---

## Diretórios Principais

```
financial/
├── .docker/            → Configurações Docker (nginx, postgres, redis)
├── prisma/             → Schema e migrations
├── src/
│   ├── base/           → BaseController, BaseRepository, Response, CacheTrait
│   ├── modules/        → Domínios isolados (auth, wallet, transaction, etc.)
│   ├── shared/         → Redis, Middlewares, Errors, DI Container
│   ├── app.ts          → Fastify app factory
│   └── server.ts       → Entry point + node-cron jobs
├── tests/              → Testes Vitest + Supertest
└── .agents/            → Documentação e guias de automação
```

---

## Fluxo de Auth

```
POST /auth/register → RegisterService → cria User + Profile + role=user
POST /auth/login    → LoginService    → valida senha → gera JWT + RefreshToken → salva token no Redis
POST /auth/logout   → LogoutService   → expires_at = now() no RefreshToken + del Redis
POST /auth/refresh  → RefreshTokenService → valida refresh → gera novo par de tokens
```

---

## Fluxo de Transação

```
POST /transactions → CreateTransactionService
  → valida carteira e categoria
  → cria Transaction (status: completed)
  → atualiza Wallet.balance (increment/decrement)
  → invalida cache da carteira e das transações

POST /transactions/transfer → TransferService
  → valida saldo suficiente
  → prisma.$transaction() para atomicidade
  → cria 2 transactions (expense + income)
  → atualiza balance das 2 carteiras
```

---

## Job de Recorrências

```
ProcessRecurrenceService (node-cron: todo dia às 00:00)
  → busca recurrences com lastProcessedAt vencido
  → para cada uma: cria Transaction + atualiza lastProcessedAt
```

---

## Documentação Swagger

Disponível em `/docs` quando o servidor está rodando.

Gerada automaticamente a partir dos schemas Fastify definidos em cada `routes.ts`.

---

## Referências

- [`.agents/agents/backend-agent.md`](.agents/agents/backend-agent.md) — Guia do agente de backend
- [`.agents/docs/backend/architecture-summary.md`](.agents/docs/backend/architecture-summary.md) — Arquitetura detalhada
- [`.agents/docs/backend/STANDARDS.md`](.agents/docs/backend/STANDARDS.md) — Padrões de código
- [`.agents/PROGRESS.md`](.agents/PROGRESS.md) — Estado atual de implementação
