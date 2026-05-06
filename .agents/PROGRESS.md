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
| `src/app.ts` + `src/server.ts` | ✅ | Inicializados com Fastify |
| `BaseController.ts` | ✅ | |
| `BaseRepository.ts` | ✅ | |
| `Response.ts` (trait JSON padronizado) | ✅ | |
| `CacheTrait.ts` | ✅ | |
| `RedisClient.ts` | ✅ | |
| `AppError.ts` + `ErrorHandler.ts` | ✅ | |
| `AuthMiddleware.ts` | ✅ | |
| `PermissionMiddleware.ts` | ⬜ | |
| Container de DI (tsyringe) | ✅ | Configuração inicial |
| Swagger (fastify-swagger) | ✅ | Configurado no app.ts |
| `.agents/` com documentação de padrões | ✅ | |

---

## 🔐 Módulo Auth

### Backend
| Item | Status | Observação |
|------|--------|------------|
| `prisma/schema.prisma` — tabelas auth | ✅ | |
| Migration auth | ✅ | |
| Seeder roles e user_statuses | ✅ | |
| `LoginDTO.ts` + `RegisterDTO.ts` | ✅ | |
| `RoleEnum.ts` | ✅ | |
| `AuthRepositoryInterface.ts` + `AuthRepository.ts` | ✅ | |
| `RegisterService.ts` | ✅ | |
| `LoginService.ts` | ✅ | |
| `LogoutService.ts` | ✅ | |
| `RefreshTokenService.ts` | ✅ | |
| `AuthController.ts` | ✅ | |
| `auth/routes.ts` | ✅ | |
| Testes auth | ✅ | Unitários e Feature (Mocked) |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| AuthContext & Providers | ✅ | |
| Página de Login | ✅ | |
| Página de Registro | ✅ | |
| Interceptor de Token Refresh | ✅ | |

---

## 👤 Módulo Profile

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `profiles` no schema | ✅ | |
| `DetailProfileService.ts` | ✅ | |
| `UpdateProfileService.ts` | ✅ | |
| `UpdateAvatarService.ts` | ✅ | |
| `ChangeProfileTypeService.ts` | ✅ | |
| `ProfileController.ts` | ✅ | |
| `profile/routes.ts` | ✅ | |
| Testes profile | ✅ | Unitários |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Página de Perfil | ✅ | Design Premium + Layout |
| Upload de Avatar | ⬜ | |

---

## 💰 Módulo Wallet

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `wallets` no schema | ✅ | |
| `CreateWalletDTO.ts` + `UpdateWalletDTO.ts` | ✅ | |
| `WalletTypeEnum.ts` | ✅ | |
| `WalletRepository.ts` | ✅ | |
| `CreateWalletService.ts` | ✅ | |
| `ListWalletsService.ts` | ✅ | |
| `DetailWalletService.ts` | ✅ | |
| `UpdateWalletService.ts` | ✅ | |
| `DeleteWalletService.ts` | ✅ | |
| `WalletController.ts` | ✅ | |
| `wallet/routes.ts` | ✅ | |
| Testes wallet | ✅ | Unitários |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Dashboard de Carteiras | ⬜ | |
| Modal Criar/Editar Carteira | ⬜ | |

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

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Listagem de Transações | ⬜ | Filtros de data/carteira |
| Modal Nova Transação | ⬜ | Entrada, Saída, Transferência |
| Edição/Exclusão | ⬜ | |
| Detalhes da Transação | ⬜ | |

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

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Listagem de Categorias | ⬜ | |
| Modal Criar/Editar | ⬜ | Seleção de cor/ícone |

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

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Listagem de Recorrências | ⬜ | |
| Modal Criar/Editar | ⬜ | Seleção de período |
| Toggle Ativar/Desativar | ⬜ | |

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

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Dashboard (Widgets) | ⬜ | |
| Gráfico de Gastos por Categoria | ⬜ | Pie Chart |
| Gráfico de Evolução Mensal | ⬜ | Area/Line Chart |
| Filtros de Relatórios | ⬜ | |
