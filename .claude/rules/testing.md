# Testes

## API — Vitest, com cobertura real (mas só unitária/mockada)

Ferramenta: **Vitest** (`vitest.config.ts`, alias `@/` para `src/`, `tests/setup.ts` como setup global). `supertest` está como devDependency mas **nenhum spec existente o usa** — não há teste de integração/HTTP real hoje, apesar do que `.agents/GEMINI.md`/`STANDARDS.md` sugerem sobre "Feature" tests com Supertest.

Specs existentes (todos em `tests/modules/{modulo}/{Service}.spec.ts`, testando Services isoladamente com mocks de Repository/Cache):

```
tests/modules/auth/LoginService.spec.ts
tests/modules/auth/RegisterService.spec.ts
tests/modules/categories/CreateCategoryService.spec.ts
tests/modules/profile/DetailProfileService.spec.ts
tests/modules/profile/UpdateProfileService.spec.ts
tests/modules/recurrences/CreateRecurrenceService.spec.ts
tests/modules/recurrences/ProcessRecurrenceService.spec.ts
tests/modules/reports/GetDashboardOverviewService.spec.ts
tests/modules/transactions/CreateTransactionService.spec.ts
tests/modules/transactions/ListTransactionsService.spec.ts
tests/modules/transactions/TransferService.spec.ts
tests/modules/wallets/CreateWalletService.spec.ts
tests/modules/wallets/ListWalletsService.spec.ts
```

Nem todo módulo/Service tem teste — `savings-goals` e `notifications` não têm nenhum spec hoje; `wallets`/`transactions`/`categories` têm cobertura parcial (só alguns Services). Trate isso como lacuna, não como "módulo sem necessidade de teste".

Convenção real: `{Ação}{Entidade}Service.spec.ts`, um arquivo por Service testado, mocks manuais de Repository/Cache passados no construtor do Service (sem lib de mock dedicada — objetos literais com `vi.fn()`).

Rodar:

```bash
cd financial-manager-api
npm test           # vitest run
npm run test:watch   # vitest (watch)
```

> **Política de execução automática, incerta**: `.agents/GEMINI.md`/`STANDARDS.md` dizem "nunca rodar os testes automaticamente — sempre recomendar ao usuário", mas o commit `9e1cf2e` do próprio histórico diz "atualizando política de execução de testes para permitir rodagem automática". As duas afirmações coexistem sem que o texto tenha sido de fato atualizado para refletir a mudança. **Confirme com o usuário antes de rodar `npm test` automaticamente** numa tarefa, em vez de assumir qualquer uma das duas políticas.

## UI — sem framework de teste instalado

Não há Vitest/Jest/React Testing Library no `package.json` da UI — zero testes automatizados no frontend hoje. Se for pedido para adicionar teste de UI, isso exige instalar e configurar a ferramenta primeiro (decisão a confirmar com o usuário, análoga à instalação do Pest no projeto de referência GIZ) — não é algo já decidido implicitamente pela stack.

## O que testar — regra de bolso

Mesma lógica do projeto de referência: teste primeiro o que, se quebrar, dói — cálculo de saldo, transferência entre carteiras, processamento de recorrência, regras de propriedade (`wallet.userId !== userId`). Os specs existentes já seguem essa priorização (`CreateTransactionService`, `TransferService`, `ProcessRecurrenceService` têm teste; CRUDs simples de categoria/perfil têm cobertura mais fina).
