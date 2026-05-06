# 📊 Progresso de Implementação — Sistema Financeiro

> **Este arquivo é a fonte da verdade sobre o estado atual do projeto.**
> Deve ser atualizado a cada fase concluída.
> Última atualização: 2026-05-06

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Concluído e testado |
| 🚧 | Em progresso |
| ⬜ | Não iniciado |
| ❌ | Bloqueado / com problema |

---

## 🏗️ Infraestrutura Base

| Item | Status | Observação |
|------|--------|------------|
| Estrutura de pastas (`api/`, `ui/`, `prisma/`, `tests/`, `api/docker/`, `ui/docker/`) | ✅ | |
| `package.json` + `tsconfig.json` | ✅ | |
| Docker (Node, Nginx, Redis, PostgreSQL 16) | ✅ | |
| `prisma/schema.prisma` — todas as tabelas | ✅ | |
| Migration inicial | ⬜ | Requer DB rodando |
| `src/app.ts` + `src/server.ts` | ✅ | Esqueletos criados |
| `BaseController.ts` | ⬜ | |
| `BaseRepository.ts` | ⬜ | |
| `Response.ts` (trait JSON padronizado) | ⬜ | |
| `CacheTrait.ts` | ⬜ | |
| `RedisClient.ts` | ⬜ | |
| `AppError.ts` + `ErrorHandler.ts` | ⬜ | |
| `AuthMiddleware.ts` | ⬜ | |
| `PermissionMiddleware.ts` | ⬜ | |
| Container de DI (tsyringe) | ⬜ | |
| Swagger (fastify-swagger) | ✅ | Instalado e configurado no app.ts (em breve) |
| `.agents/` com documentação de padrões | ✅ | Atualizado em 2026-05-06 |

---

## 🔐 Módulo Auth

### Backend
| Item | Status | Observação |
|------|--------|------------|
| `prisma/schema.prisma` — tabelas auth | ⬜ | users, roles, user_statuses, user_has_statuses, refresh_tokens |
| Migration auth | ⬜ | |
| Seeder roles e user_statuses | ⬜ | |
| `LoginDTO.ts` + `RegisterDTO.ts` | ⬜ | Validação Zod |
| `RoleEnum.ts` | ⬜ | |
| `AuthRepositoryInterface.ts` + `AuthRepository.ts` | ⬜ | |
| `RegisterService.ts` | ⬜ | Hash bcrypt |
| `LoginService.ts` | ⬜ | JWT access + refresh |
| `LogoutService.ts` | ⬜ | expires_at = now() |
| `RefreshTokenService.ts` | ⬜ | |
| `AuthController.ts` | ⬜ | |
| `auth/routes.ts` | ⬜ | |
| Testes auth | ⬜ | `tests/auth/` |

---

## 👤 Módulo Profile

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `profiles` no schema | ⬜ | |
| `DetailProfileService.ts` | ⬜ | Cache Redis |
| `UpdateProfileService.ts` | ⬜ | Invalida cache |
| `UpdateAvatarService.ts` | ⬜ | Storage local |
| `ChangeProfileTypeService.ts` | ⬜ | personal ↔ business |
| `ProfileController.ts` | ⬜ | |
| `profile/routes.ts` | ⬜ | |
| Testes profile | ⬜ | `tests/profile/` |

---

## 💰 Módulo Wallet

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `wallets` no schema | ⬜ | |
| `CreateWalletDTO.ts` + `UpdateWalletDTO.ts` | ⬜ | |
| `WalletTypeEnum.ts` | ⬜ | personal, business |
| `WalletRepository.ts` | ⬜ | |
| `CreateWalletService.ts` | ⬜ | |
| `ListWalletsService.ts` | ⬜ | Cache Redis |
| `DetailWalletService.ts` | ⬜ | saldo + últimas transações |
| `UpdateWalletService.ts` | ⬜ | |
| `DeleteWalletService.ts` | ⬜ | Soft delete |
| `WalletController.ts` | ⬜ | |
| `wallet/routes.ts` | ⬜ | |
| Testes wallet | ⬜ | `tests/wallet/` |

---

## 💳 Módulo Transaction

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `transactions` no schema | ⬜ | |
| `TransactionTypeEnum.ts` | ⬜ | income, expense, transfer |
| `TransactionStatusEnum.ts` | ⬜ | pending, completed, cancelled |
| DTOs de transação | ⬜ | |
| `TransactionRepository.ts` | ⬜ | |
| `CreateTransactionService.ts` | ⬜ | Atualiza balance da wallet |
| `ListTransactionsService.ts` | ⬜ | Filtros + paginação + cache |
| `DetailTransactionService.ts` | ⬜ | |
| `UpdateTransactionService.ts` | ⬜ | Recalcula balance |
| `DeleteTransactionService.ts` | ⬜ | Recalcula balance |
| `TransferService.ts` | ⬜ | Duas transações atômicas |
| `TransactionController.ts` | ⬜ | |
| `transaction/routes.ts` | ⬜ | |
| Testes transaction | ⬜ | `tests/transaction/` |

---

## 🏷️ Módulo Category

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `categories` no schema | ⬜ | |
| DTOs de categoria | ⬜ | |
| `CategoryRepository.ts` | ⬜ | |
| `ListCategoriesService.ts` | ⬜ | Sistema + do usuário |
| `CreateCategoryService.ts` | ⬜ | |
| `UpdateCategoryService.ts` | ⬜ | |
| `DeleteCategoryService.ts` | ⬜ | |
| `CategoryController.ts` | ⬜ | |
| `category/routes.ts` | ⬜ | |
| Testes category | ⬜ | |

---

## 🔁 Módulo Recurrence

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `recurrences` no schema | ⬜ | |
| `RecurrencePeriodEnum.ts` | ⬜ | daily, weekly, monthly, yearly |
| DTOs de recorrência | ⬜ | |
| `RecurrenceRepository.ts` | ⬜ | |
| `CreateRecurrenceService.ts` | ⬜ | |
| `ListRecurrencesService.ts` | ⬜ | |
| `ProcessRecurrenceService.ts` | ⬜ | Job node-cron |
| `CancelRecurrenceService.ts` | ⬜ | |
| `RecurrenceController.ts` | ⬜ | |
| `recurrence/routes.ts` | ⬜ | |
| Testes recurrence | ⬜ | |

---

## 📊 Módulo Report

### Backend
| Item | Status | Observação |
|------|--------|------------|
| `BalanceSummaryService.ts` | ⬜ | CTE |
| `ExpensesByCategoryService.ts` | ⬜ | CTE |
| `MonthlyEvolutionService.ts` | ⬜ | CTE |
| `ReportController.ts` | ⬜ | |
| `report/routes.ts` | ⬜ | |
| Testes report | ⬜ | |
