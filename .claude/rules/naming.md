# Convenções de nomenclatura

## Idioma

Identificadores de código em **inglês**. Mensagens ao usuário (`message` de resposta, texto de UI, mensagem de validação Zod) em **português**.

## Convenção real por elemento (API)

| Elemento | Convenção real | Exemplo observado |
|----------|-----------------|--------------------|
| Classe (Controller/Service/Repository) | `PascalCase` | `CreateWalletService`, `TransactionController` |
| Interface de Repository | `PascalCase` + sufixo `Interface` | `WalletRepositoryInterface` |
| Enum | `PascalCase` + sufixo `Enum` | `TransactionTypeEnum`, `WalletTypeEnum` |
| DTO (schema Zod) | `PascalCase` + sufixo `DTO`, tipo inferido com sufixo `DTOType` | `CreateWalletDTO` / `CreateWalletDTOType` |
| Métodos/funções | `camelCase` | `execute()`, `findById()` |
| **Variáveis e parâmetros TypeScript** | `camelCase` — **não** `snake_case` | `userId`, `newBalance`, `walletId` |
| Campo de DTO (contrato HTTP) | `snake_case` | `wallet_id`, `occurred_at`, `category_id` |
| Campo do Prisma Client (código) | `camelCase`, mapeado com `@map` para coluna `snake_case` | `walletId` (TS) → `wallet_id` (coluna) |
| Arquivo de classe | `PascalCase.ts` | `WalletController.ts` |

> **Correção em relação a `.agents/docs/backend/STANDARDS.md`**: esse documento descreve variáveis/parâmetros como `snake_case` (`user_id`, `wallet_balance`). O código real usa **camelCase** nas variáveis TypeScript quase universalmente — `snake_case` só aparece no contrato de entrada/saída HTTP (campos de DTO) e nas colunas de banco. Ao escrever código novo, siga o código, não esse trecho do `STANDARDS.md`.

> **`.agents/docs/backend/naming-conventions.md` não se aplica a este projeto**: documenta convenções de **PHP/Laravel** (`Migrations .php`, `Requests`, `Resources`, `Policy`, rota `dot.case` estilo Laravel) — é um artefato copiado de outro stack (provavelmente do harness de um projeto Laravel de referência) e não reflete nada do código TypeScript/Fastify real. Ignore esse arquivo ao nomear algo neste repositório.

## Boy Scout Rule

Ao criar ou tocar qualquer arquivo, adapte **o arquivo inteiro** aos padrões reais (tabela acima), mas:
- **Não** migre `TransactionRepository`/outros para estender `BaseRepository` (ou vice-versa) só por tocar o arquivo — é uma decisão estrutural, ver `CLAUDE.md` > Débito Técnico #1.
- **Não** renomeie `ICreateSavingsGoalDTO.ts`/`ICreateTransferDTO.ts`/`IUpdateCategoryDTO.ts` para remover o prefixo `I` só por tocar o arquivo — mesma lógica.
- **Não** troque `as any` por `.parse(schema)` em métodos de Controller que você não está adicionando/alterando na mesma tarefa.

## UI (React)

| Elemento | Convenção real | Exemplo observado |
|----------|-----------------|--------------------|
| Componente/página | `PascalCase.tsx`, um por arquivo | `WalletsPage.tsx`, `CreateWalletModal.tsx` |
| Página | sufixo `Page` | `TransactionsPage`, `DashboardPage` |
| Modal/formulário | prefixo de ação + sufixo `Modal` | `CreateTransactionModal`, `UpdateCategoryModal` |
| Hook/Context | `use{Algo}` / `{Algo}Context` | `useAuth` (via `AuthContext`) |
| Variáveis | `camelCase` | `signIn`, `storageUser` |
| Chaves de `localStorage` | prefixo namespaced `@FinancialManager:` | `@FinancialManager:token`, `@FinancialManager:user` |
