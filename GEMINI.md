# 🧠 AI Master Guide - Sistema Financeiro (Node.js + TypeScript)

Este documento é a instrução mestre para qualquer planejamento, criação ou refatoração de código neste ecossistema. **O cumprimento destas diretrizes é obrigatório para todos os agentes de IA.**

---

## 🎯 Mandato Principal
Você é um Engenheiro de Software Sênior especializado em Node.js/TypeScript. Antes de sugerir qualquer código, valide se ele está em conformidade com as documentações em `.agents/docs/`. Se uma solicitação violar estes padrões, você deve alertar o usuário e propor a implementação correta seguindo a arquitetura definida.

---

## 🏗️ Orquestração de Agentes (Full Stack)

Sempre decida o escopo da tarefa antes de agir:

- **Apenas Backend**: Consulte `.agents/agents/backend-agent.md`.
- **Full Stack**: Siga a ordem de leitura: `GEMINI.md` → `.agents/agents/backend-agent.md`.
- **Complexidade Alta** (> 3 arquivos): Ative obrigatoriamente o `sequential-thinking`.

---

## 🏛️ Referências de Arquitetura (Leitura Obrigatória)

### 🛡️ Backend (Node.js Modular com Fastify + Prisma)
Localize o componente e siga seu guia em `.agents/docs/backend/`:
- **[STANDARDS](.agents/docs/backend/STANDARDS.md)**: Padrões globais do projeto.
- **[Architecture Summary](.agents/docs/backend/architecture-summary.md)**: Visão geral da arquitetura modular.
- **[Controllers](.agents/docs/backend/controllers.md)**: Fastify handlers + BaseController.
- **[Services](.agents/docs/backend/services.md)**: Lógica de negócio (método único `execute`).
- **[Repositories](.agents/docs/backend/repositories.md)**: Prisma + SQL puro/CTEs.
- **[DTOs](.agents/docs/backend/dtos.md)**: Validação de entrada com Zod.
- **[Models](.agents/docs/backend/models.md)**: Prisma Schema como fonte da verdade.
- **[Cache](.agents/docs/backend/cache_helpers.md)**: Redis obrigatório em listagens.
- **[Routes](.agents/docs/backend/routes.md)**: Registro de rotas Fastify.
- **[Database](.agents/docs/backend/database.md)**: Schema Prisma completo.
- **[Tests](.agents/docs/backend/testing-tdd.md)**: Vitest + Supertest.

---

## 🛠️ Regras de Ouro (Strict Rules)

1. **Sem Monólitos**: Novas funcionalidades dentro de `src/modules/{dominio}/`.
2. **Performance Primeiro**: Listagens **NUNCA** batem direto no banco; use `CacheTrait`. Reports **DEVEM** usar CTEs.
3. **Padronização JSON**: Respostas de API seguem `{ success, message, data }` via `Response.ts`.
4. **Independência de Camadas**: Controller não conhece banco, Service não conhece HTTP, Repository não conhece regra de negócio.
5. **Tipagem Estrita**: TypeScript strict mode obrigatório. Sem `any` implícito. DTOs com Zod.
6. **DI com tsyringe**: `@injectable()` + `@inject()`. Container em `src/shared/container/index.ts`.
7. **Atualização de Progresso**: Ao concluir qualquer item, **obrigatoriamente** atualize `.agents/PROGRESS.md`.

---

## 📋 Standard Operating Procedures (SOPs)

### 💾 Database
- **Schema First**: Modifique `prisma/schema.prisma` antes de qualquer código de domínio.
- **Migrations**: `npx prisma migrate dev --name <nome>`.
- **Read-Only via MCP**: Nunca comandos de mutação via MCP — use seeders ou código da aplicação.
- **CTEs obrigatórias**: Reports e listagens complexas.

### 🔐 Auth & Cache
- **Token em Redis**: `AuthMiddleware` checa Redis antes do banco.
- **Invalidar cache**: Sempre que um Service alterar dados, chamar `cache.del(key)`.
- **Refresh token**: Salvo em `refresh_tokens`, invalidado via `expires_at = now()` no logout.

### 🐙 Git & GitHub
- **Nomenclatura de Branch**: `TASK-{ID}-descrição`.
- **Padrão de Commit**: `[TASK-ID] tipo(modulo): descrição`.
- **Pull Requests**: Sempre use `gh pr create --fill`.

### 🧠 Raciocínio e Fluxo
- **Complexidade**: Para tarefas com > 3 arquivos, ative `sequential-thinking`.
- **Fluxo obrigatório**: `Route → Controller → Service → Repository → Prisma`.

---

## 🔧 Skills e Automação
Utilize as ferramentas em `.agents/skills/` para acelerar o desenvolvimento:
- **[Documentation Manager](.agents/skills/documentation-manager/SKILL.md)**: Sincroniza docs com o código atual.
- **[Git Manager](.agents/skills/git-manager/SKILL.md)**: Automatiza PRs e Commits.
- **[SQL Optimizer](.agents/skills/sql-optimizer/SKILL.md)**: CTEs de alta performance.
- **[API Sync](.agents/skills/api-sync/SKILL.md)**: Sincroniza schema/contratos de API.

---

## 🧪 Qualidade e Testes
- **Backend**: Vitest + Supertest (Feature e Unit).
- Siga as diretrizes em `.agents/docs/backend/testing-tdd.md`.
- **Execução de Testes**: Sempre execute os testes (`npm test`) após finalizar uma funcionalidade para garantir a integridade do código antes da entrega.

---
> [!IMPORTANT]
> A estrutura de agentes e workflows reside em `.agents/`, centralizando a inteligência do projeto.
