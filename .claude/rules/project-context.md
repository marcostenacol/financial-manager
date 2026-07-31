# Contexto do Projeto — Financial Manager

## O que é

Sistema de **gestão financeira pessoal**, single-tenant (não há organização/empresa — isolamento de dado é só por `userId`). Usuário se cadastra/loga, gerencia uma ou mais **carteiras** (`wallets`), lança **transações** de receita/despesa, categoriza cada transação, agenda **recorrências** (lançamentos automáticos futuros), define **metas de economia** e acompanha um **dashboard**/relatórios de evolução financeira. Recebe **notificações** dentro da aplicação.

Inferido do código real (`prisma/schema.prisma`, módulos em `src/modules/`) — não há documento de produto/negócio formal além de `.agents/docs/project-overview.md` (que pode conter itens aspiracionais; cruzar com o schema antes de assumir que um recurso já existe).

## Módulos reais (API)

| Módulo | Do que trata |
|--------|--------------|
| `auth` | Registro, login, logout, refresh token — JWT via `@fastify/jwt` |
| `profile` | Dados do usuário logado, avatar, tipo de perfil |
| `wallets` | Carteiras do usuário — saldo, tipo (`WalletTypeEnum`) |
| `transactions` | Lançamentos de receita/despesa (`TransactionTypeEnum`, `TransactionStatusEnum`), transferência entre carteiras (`TransferService`) |
| `categories` | Categorias de transação, por usuário |
| `recurrences` | Lançamentos recorrentes — processados via `RecurrenceJob.ts` (node-cron) |
| `reports` | Dashboard geral, despesas por categoria, evolução mensal |
| `savings-goals` | Metas de economia |
| `notifications` | Notificações do usuário dentro da aplicação |

## Conceitos-chave

- **Wallet (carteira)**: conta/origem de dinheiro do usuário, com saldo (`balance`) atualizado quando uma transação `COMPLETED` é criada/alterada.
- **Transaction (transação)**: lançamento de receita (`INCOME`) ou despesa (`EXPENSE`), com `status` (ex.: `COMPLETED`), `category`, `occurredAt`.
- **Transfer (transferência)**: operação atômica entre duas carteiras do mesmo usuário, tratada por um Service dedicado (`TransferService`), não como duas transações independentes criadas manualmente pelo chamador.
- **Recurrence (recorrência)**: regra de lançamento futuro recorrente, processada em lote por um cron job.
- **Savings goal (meta de economia)**: valor-alvo de economia, acompanhado ao longo do tempo.

## Atores

Um único tipo de usuário final autenticado (`User`, com `Role` — `admin`/`user` conforme `RoleEnum`/seed do schema). Não há papéis administrativos distintos observados em uso real hoje (nenhum Controller/Service checa `role` para autorizar uma ação) — a tabela `roles` existe no schema mas não há `PermissionMiddleware` real além do que está mencionado como pendente (`⬜`) em `.agents/PROGRESS.md`.

## Conformidade

O sistema trata dado financeiro pessoal do usuário (saldo, lançamentos, metas). Não há indicação de tratamento de dado de terceiros/menores como no projeto de referência GIZ — ainda assim, trate saldo/senha/token como dado sensível: nunca logue senha em claro, nunca inclua valor de saldo/transação em log de erro genérico.
