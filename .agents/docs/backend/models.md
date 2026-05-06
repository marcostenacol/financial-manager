# Models — Prisma Schema como Fonte da Verdade

## Papel

No contexto Prisma, "Model" se refere às **entidades do schema Prisma** (`prisma/schema.prisma`). Não há classes de Model no código — o Prisma Client gerado a partir do schema é a interface para acesso aos dados.

---

## Princípio

- **Único arquivo de modelo**: `prisma/schema.prisma`.
- **Nunca** definir a estrutura de dados em TypeScript separadamente — use o schema Prisma.
- Os tipos TypeScript dos modelos são gerados automaticamente pelo Prisma Client.

---

## Importando Tipos Gerados

```typescript
import { Wallet, Transaction, User, Profile } from '@prisma/client';

// Tipo com relações
import { Prisma } from '@prisma/client';
type WalletWithTransactions = Prisma.WalletGetPayload<{
  include: { transactions: true };
}>;
```

---

## Extensões de Tipo (quando necessário)

Para tipos de resposta da API (sem campos sensíveis como `password`):

```typescript
// src/modules/auth/types/UserResponse.ts
import { User } from '@prisma/client';

export type UserResponse = Omit<User, 'password'>;
```

---

## Modelos do Sistema

### User
```
id, email, password, roleId, lastStatusId, createdAt, updatedAt
→ Relações: role, lastStatus, statusHistory, refreshTokens, profile, wallets
```

### Role
```
id, name, slug (admin | user)
```

### UserStatus
```
id, name, slug (active | inactive | banned)
```

### UserHasStatus
```
id, userId, statusId, reason, createdBy, createdAt
→ Histórico de mudanças de status do usuário
```

### RefreshToken
```
id, userId, token, expiresAt, createdAt
→ Invalidado via expiresAt = now() no logout
```

### Profile
```
id, userId (unique), name, avatar, bio, type (personal | business), createdAt, updatedAt
```

### Wallet
```
id, userId, name, type (personal | business), balance (Decimal 15,2), currency, deletedAt, createdAt, updatedAt
→ balance é cache do saldo atual — atualizado a cada transaction
→ Soft delete via deletedAt
```

### Category
```
id, userId (null = sistema), name, color, icon, type (income | expense | both), createdAt
→ userId null = categoria padrão do sistema, visível a todos
```

### Transaction
```
id, walletId, categoryId, recurrenceId (nullable), type (income | expense | transfer),
amount (Decimal 15,2), description, status (pending | completed | cancelled),
occurredAt, createdAt, updatedAt
→ Cada transaction atualiza o balance da Wallet correspondente
```

### Recurrence
```
id, walletId, categoryId, type (income | expense), amount (Decimal 15,2),
description, period (daily | weekly | monthly | yearly), startsAt, endsAt,
lastProcessedAt, createdAt
→ Processada pelo ProcessRecurrenceService via node-cron
```

---

## Relações Importantes

```
User 1──* Wallet 1──* Transaction
                   └──* Recurrence
User 1──1 Profile
User *──1 Role
Transaction *──1 Category
Recurrence  *──1 Category
```

---

## Regras

- Nunca criar classes de entidade em TypeScript — use os tipos gerados pelo Prisma.
- Para tipos de resposta sem campos sensíveis, use `Omit<Model, 'campo'>`.
- Para tipos com relações específicas, use `Prisma.ModelGetPayload<{ include: ... }>`.
- Após qualquer mudança no `schema.prisma`, sempre rodar `npx prisma generate`.
- Soft delete: `deletedAt DateTime?` — filtre com `where: { deleted_at: null }` nas queries.
- Decimais financeiros: `@db.Decimal(15, 2)` — nunca `Float`.
