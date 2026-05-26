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
| Makefiles (Root, API, UI) | ✅ | Orquestração de comandos |
| `prisma/schema.prisma` — todas as tabelas | ✅ | |
| Migration inicial | ⬜ | Requer DB rodando |
| `src/app.ts` + `src/server.ts` | ✅ | Inicializados com Fastify |
| `BaseController.ts` | ✅ | |
| `BaseRepository.ts` | ✅ | |
| `Response.ts` (trait JSON padronizado) | ✅ | |
| `CacheTrait.ts` | ✅ | |
| `RedisClient.ts` | ✅ | |
| `AppError.ts` + `ErrorHandler.ts` | ✅ | |
| `AuthMiddleware.ts` | ✅ | Verificação de cache inicial |
| `PermissionMiddleware.ts` | ✅ | RBAC por roles |
| Container de DI (tsyringe) | ✅ | Registro global de serviços |
| Validação de DTOs nos Controllers | ✅ | Todos os módulos usando Zod |
| Invalidação de Cache (Wildcards) | ✅ | Usando `delPattern` em Transações |
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
| Página de Perfil | ✅ | Sincronizada com Bio e Type |
| Upload de Avatar | ✅ | Frontend + Backend Multipart |
| Sincronização AuthContext | ✅ | Usando `updateUser` no sucesso |

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
| Dashboard de Carteiras | ✅ | Cards Premium com Glassmorphism |
| Modal Criar/Editar Carteira | ✅ | Modal com Seleção de Ícones e Exclusão |

---

## 💳 Módulo Transaction

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `transactions` no schema | ✅ | |
| `TransactionTypeEnum.ts` | ✅ | income, expense, transfer |
| `TransactionStatusEnum.ts` | ✅ | pending, completed, cancelled |
| DTOs de transação | ✅ | |
| `TransactionRepository.ts` | ✅ | |
| `CreateTransactionService.ts` | ✅ | Atualiza balance da wallet |
| `ListTransactionsService.ts` | ✅ | Filtros + paginação + cache |
| `DetailTransactionService.ts` | ✅ | |
| `UpdateTransactionService.ts` | ✅ | Recalcula balance |
| `DeleteTransactionService.ts` | ✅ | Recalcula balance |
| `TransferService.ts` | ✅ | Duas transações atômicas via Prisma |
| `TransactionController.ts` | ✅ | |
| `transaction/routes.ts` | ✅ | |
| Testes transaction | ✅ | List e Create Services |

> [!NOTE]
> **Transferências Financeiras**: Requer o `TransferService` para criar duas transações atômicas (saída da origem e entrada no destino) com status de transferência. Pendente integração no frontend.

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Listagem de Transações | ✅ | Filtros Rápidos + Design Premium |
| Modal Nova Transação | ✅ | Entrada/Saída + Seleção de Carteira |
| Modal de Transferência | ✅ | Seleção de origem/destino e categoria |
| Detalhes da Transação | ✅ | Visualização rica e detalhada |
| Busca em Tempo Real | ✅ | Integração com API (Search) |
| Filtros Avançados | ✅ | Data, Categoria, Status, Carteira |
| Paginação de Resultados | ✅ | Suporte a grandes volumes de dados |

---

## 🏷️ Módulo Category

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `categories` no schema | ✅ | |
| DTOs de categoria | ✅ | |
| `CategoryRepository.ts` | ✅ | |
| `ListCategoriesService.ts` | ✅ | Sistema + do usuário |
| `CreateCategoryService.ts` | ✅ | |
| `UpdateCategoryService.ts` | ✅ | |
| `DeleteCategoryService.ts` | ✅ | |
| `CategoryController.ts` | ✅ | |
| `category/routes.ts` | ✅ | |
| Testes category | ✅ | Create Service |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Listagem de Categorias | ✅ | Grid de cards coloridos |
| Modal Criar/Editar | ✅ | Seletor de Cores + Tipo |

---

## 🔁 Módulo Recurrence

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `recurrences` no schema | ✅ | |
| `RecurrencePeriodEnum.ts` | ✅ | daily, weekly, monthly, yearly |
| DTOs de recorrência | ✅ | |
| `RecurrenceRepository.ts` | ✅ | |
| `CreateRecurrenceService.ts` | ✅ | |
| `ListRecurrencesService.ts` | ✅ | |
| `ProcessRecurrenceService.ts` | ✅ | Job node-cron implementado |
| `CancelRecurrenceService.ts` | ✅ | |
| `RecurrenceController.ts` | ✅ | |
| `recurrence/routes.ts` | ✅ | |
| Testes recurrence | ✅ | Create Service |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Listagem de Recorrências | ✅ | Cards com periodicidade |
| Modal Criar/Editar | ✅ | Seleção de período |
| Toggle Ativar/Desativar | ✅ | Pausar sem encerrar o ciclo |
| Cancelamento de Recorrência | ✅ | Implementado via PATCH |

---

## 🎯 Módulo Savings Goals (Metas)

### Backend
| Item | Status | Observação |
|------|--------|------------|
| Tabela `savings_goals` no schema | ✅ | Prisma 7 |
| `SavingsGoalRepository.ts` | ✅ | |
| `CreateSavingsGoalService.ts` | ✅ | |
| `ListSavingsGoalsService.ts` | ✅ | Cache-Aside |
| `UpdateSavingsGoalService.ts` | ✅ | |
| `DeleteSavingsGoalService.ts` | ✅ | |
| `SavingsGoalController.ts` | ✅ | |
| `savings-goals/routes.ts` | ✅ | |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Página de Metas | ✅ | Progress Bars Animadas |
| Modal Criar/Editar | ✅ | Seletor de Cores |
| Lógica de Edição/Exclusão de Metas | ✅ | Integrado com Backend |
| Widget no Dashboard | ✅ | Resumo visual de progresso |

---

## 📊 Módulo Report

### Backend
| Item | Status | Observação |
|------|--------|------------|
| `ReportRepository.ts` | ✅ | SQL Puro + CTEs (Dashboard & Category) |
| `GetDashboardOverviewService.ts` | ✅ | Métricas Financeiras Principais |
| `GetExpensesByCategoryService.ts` | ✅ | Agrupamento por categoria |
| `ReportController.ts` | ✅ | |
| `report/routes.ts` | ✅ | |
| Testes report | ✅ | Dashboard Overview Service |

### Frontend
| Item | Status | Observação |
|------|--------|------------|
| Dashboard (Widgets) | ✅ | Saldo, Receita, Despesa |
| Gráfico de Gastos por Categoria | ✅ | Barras de Progresso Animadas |
| Gráfico de Evolução Mensal | ✅ | AreaChart (Recharts) |
| Filtros por Período no Dashboard | ✅ | Global para todos os widgets |
| Exportação de Relatórios (PDF/Excel) | ✅ | Backend + Frontend |

> [!IMPORTANT]
> **Dashboard Overview**: A página inicial do sistema deve integrar todos os widgets de relatórios (Saldo Total, Evolução Mensal e Gastos por Categoria) utilizando as CTEs otimizadas.
## 🔔 Módulo Notifications
| Item | Status | Observação |
|------|--------|------------|
| Tabela `notifications` no schema | ✅ | Incluída relação com User |
| Central de Notificações (UI) | ✅ | Sino na Sidebar com Dropdown |
| Gatilhos de Alerta (Saldo, Metas) | ✅ | Iniciado com Recorrências |

---

## 🧪 Qualidade
| Item | Status | Observação |
|------|--------|------------|
| Testes Unitários (> 80%) | 🚧 | Foco em Backend |
