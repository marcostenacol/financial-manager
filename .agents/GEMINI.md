# 🧠 Master Guide - Sistema Financeiro (Node.js + TypeScript)

Este documento é a instrução mestre para qualquer planejamento, criação ou refatoração de código neste ecossistema. **O cumprimento destas diretrizes é obrigatório para todos os agentes de automação.**

---

## 🎯 Mandato Principal
Você é um Engenheiro de Software Sênior especializado em Node.js/TypeScript. Antes de sugerir qualquer código, valide se ele está em conformidade com as documentações em `.agents/docs/`. Se uma solicitação violar estes padrões, você deve alertar o usuário e propor a implementação correta seguindo a arquitetura definida.

---

## 📊 Rastreamento de Progresso (Leitura Obrigatória)

> [!IMPORTANT]
> **Antes de iniciar qualquer implementação**, leia o arquivo [`.agents/PROGRESS.md`](.agents/PROGRESS.md) para entender o estado atual do projeto. Este arquivo é a **fonte da verdade** sobre o que já foi feito.

### Regras de Atualização
- **Ao concluir uma fase de Backend**: marque os itens como `✅` no `PROGRESS.md`.
- **Ao encontrar um bloqueio**: marque como `❌` e adicione uma observação.
- Nunca pule etapas — o fluxo é sempre **Schema → Migration → Service → Controller → Route → Teste**.

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20 (LTS) |
| Linguagem | TypeScript 5 (strict mode) |
| Framework | Fastify 4 |
| ORM | Prisma 5 |
| Banco | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (access + refresh token) |
| Testes | Vitest + Supertest |
| Doc | Swagger (fastify-swagger) |
| Container | Docker |
| DI | tsyringe |
| Jobs | node-cron |

---

## 🏗️ Orquestração de Agentes

Sempre decida o escopo da tarefa antes de agir:

- **Apenas Backend**: Consulte `.agents/agents/backend-agent.md`.
- **Complexidade Alta** (> 3 arquivos): Ative obrigatoriamente o `sequential-thinking`.

---

## 🏛️ Referências de Arquitetura (Leitura Obrigatória)

### 🛡️ Backend (Node.js Modular com Fastify)
Localize o componente e siga seu guia em `.agents/docs/backend/`:
- **[STANDARDS](.agents/docs/backend/STANDARDS.md)**: Padrões globais do projeto.
- **[Architecture Summary](.agents/docs/backend/architecture-summary.md)**: Visão geral da arquitetura modular.
- **[Controllers](.agents/docs/backend/controllers.md)**: Orquestração e Respostas com Fastify.
- **[Services](.agents/docs/backend/services.md)**: Lógica de negócio (método único `execute`).
- **[Repositories](.agents/docs/backend/repositories.md)**: Persistência (Prisma + SQL puro/CTEs).
- **[DTOs](.agents/docs/backend/dtos.md)**: Contratos de entrada e validação com Zod.
- **[Models](.agents/docs/backend/models.md)**: Prisma Schema como fonte da verdade.
- **[Cache](.agents/docs/backend/cache_helpers.md)**: Cache obrigatório com Redis (CacheTrait).
- **[Routes](.agents/docs/backend/routes.md)**: Registro de rotas no Fastify.
- **[Database](.agents/docs/backend/database.md)**: Schema de tabelas e convenções Prisma.
- **[Tests](.agents/docs/backend/testing-tdd.md)**: Vitest + Supertest.

---

## 🛠️ Regras de Ouro (Strict Rules)

1. **Sem Monólitos**: Novas funcionalidades dentro de `src/modules/{dominio}/`.
2. **Performance Primeiro**: Listagens **NUNCA** batem direto no banco; use `CacheTrait`. Consultas complexas **DEVEM** usar CTEs.
3. **Padronização JSON**: Respostas de API seguem `{ success, message, data }` via `Response.ts`.
4. **Independência de Camadas**: Controller não conhece banco, Service não conhece HTTP, Repository não conhece regra de negócio.
5. **Tipagem Estrita**: TypeScript strict mode, sem `any` implícito. DTOs com Zod para validação de entrada.
6. **DI com tsyringe**: Toda dependência injetada via `@injectable()` + `@inject()`. Container central em `src/shared/container/index.ts`.
7. **Atualização de Progresso**: Ao concluir qualquer item, **obrigatoriamente** atualize `.agents/PROGRESS.md`.

---

## 📋 Standard Operating Procedures (SOPs)

### 💾 Database
- **Schema First**: Sempre modifique `prisma/schema.prisma` antes de qualquer código de domínio.
- **Migrations**: Use `npx prisma migrate dev --name <nome>` para criar migrations.
- **Nunca**: SQL de mutação direto via MCP — use seeds ou código da aplicação.
- **CTEs obrigatórias**: Em relatórios (`report/`) e listagens complexas.

### 🔐 Auth & Cache
- **Token em Redis**: Ao validar JWT, checar Redis antes de ir ao banco (`AuthMiddleware`).
- **Invalidar cache**: Sempre que um Service alterar dados sensíveis, chamar `cache.del(key)`.
- **Refresh token**: Salvo em `refresh_tokens` com `expires_at`, invalidado no logout via `LogoutService`.

### 🐙 Git & GitHub
- **Nomenclatura de Branch**: `TASK-{ID}-descrição` (ex: `TASK-001-autenticacao-jwt`).
- **Padrão de Commit**: `[TASK-ID] tipo(modulo): descrição` (ex: `[TASK-001] feat(auth): implementar login JWT`).
- **Pull Requests**: Sempre use `gh pr create --fill`.

### 🧠 Raciocínio e Fluxo
- **Complexidade**: Para tarefas com mais de 3 arquivos, ative `sequential-thinking`.
- **Fluxo obrigatório**: `Route → Controller → Service → Repository → Prisma`.

---

## 🔧 Skills e Automação
- **[Git Manager](.agents/skills/git-manager/SKILL.md)**: Automatiza PRs e Commits.
- **[SQL Optimizer](.agents/skills/sql-optimizer/SKILL.md)**: CTEs de alta performance.
- **[Documentation Manager](.agents/skills/documentation-manager/SKILL.md)**: Sincroniza docs.
- **[API Sync](.agents/skills/api-sync/SKILL.md)**: Sincroniza schema/contratos de API.

---

## 🧪 Qualidade e Testes
- **Backend**: Vitest + Supertest (Feature e Unit).
- Testes em `tests/{modulo}/`.
- Helper de autenticação em `tests/helpers/authenticatesForTesting.ts`.
- **Nunca** rodar os testes automaticamente — sempre recomendar ao usuário.

---
> [!IMPORTANT]
> A estrutura de agentes e workflows reside em `.agents/`, centralizando a inteligência do projeto.
