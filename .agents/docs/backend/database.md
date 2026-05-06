# Database — Schema Prisma e Convenções

## Fonte da Verdade

O arquivo `prisma/schema.prisma` é a **única fonte da verdade** para a estrutura do banco de dados. Nunca altere o banco diretamente; sempre via migration Prisma.

---

## Configuração do Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Convenções Prisma

| Elemento | Convenção |
|----------|-----------|
| Nomes de modelo | `PascalCase` (ex: `Wallet`, `Transaction`) |
| Campos no código | `camelCase` (ex: `userId`, `createdAt`) |
| Campos no banco (`@map`) | `snake_case` (ex: `user_id`, `created_at`) |
| Tabela no banco (`@@map`) | `snake_case` plural (ex: `wallets`, `transactions`) |
| PKs | `uuid` com `@default(uuid())` |
| Timestamps | `createdAt DateTime @default(now()) @map("created_at")` |

---

## Schema Completo — Sistema Financeiro

```prisma
// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

model Role {
  id    String @id @default(uuid())
  name  String
  slug  String @unique  // admin, user

  users User[]

  @@map("roles")
}

model UserStatus {
  id   String @id @default(uuid())
  name String
  slug String @unique  // active, inactive, banned

  userHasStatuses UserHasStatus[]

  @@map("user_statuses")
}

model User {
  id           String  @id @default(uuid())
  email        String  @unique
  password     String
  roleId       String  @map("role_id")
  lastStatusId String? @map("last_status_id")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  role            Role            @relation(fields: [roleId], references: [id])
  lastStatus      UserStatus?     @relation("LastStatus", fields: [lastStatusId], references: [id])
  statusHistory   UserHasStatus[]
  refreshTokens   RefreshToken[]
  profile         Profile?
  wallets         Wallet[]

  @@map("users")
}

model UserHasStatus {
  id        String  @id @default(uuid())
  userId    String  @map("user_id")
  statusId  String  @map("status_id")
  reason    String?
  createdBy String? @map("created_by")

  createdAt DateTime @default(now()) @map("created_at")

  user   User       @relation(fields: [userId], references: [id])
  status UserStatus @relation(fields: [statusId], references: [id])

  @@map("user_has_statuses")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")

  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("refresh_tokens")
}

// ─────────────────────────────────────────
// SOCIAL
// ─────────────────────────────────────────

model Profile {
  id     String  @id @default(uuid())
  userId String  @unique @map("user_id")
  name   String
  avatar String?
  bio    String?
  type   String  // personal, business

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])

  @@map("profiles")
}

// ─────────────────────────────────────────
// FINANCIAL
// ─────────────────────────────────────────

model Wallet {
  id       String  @id @default(uuid())
  userId   String  @map("user_id")
  name     String
  type     String  // personal, business
  balance  Decimal @default(0) @db.Decimal(15, 2)
  currency String  @default("BRL")
  deletedAt DateTime? @map("deleted_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  recurrences  Recurrence[]

  @@map("wallets")
}

model Category {
  id     String  @id @default(uuid())
  userId String? @map("user_id")  // null = categoria do sistema
  name   String
  color  String
  icon   String?
  type   String  // income, expense, both

  createdAt DateTime @default(now()) @map("created_at")

  transactions Transaction[]
  recurrences  Recurrence[]

  @@map("categories")
}

model Transaction {
  id           String   @id @default(uuid())
  walletId     String   @map("wallet_id")
  categoryId   String   @map("category_id")
  recurrenceId String?  @map("recurrence_id")
  type         String   // income, expense, transfer
  amount       Decimal  @db.Decimal(15, 2)
  description  String?
  status       String   // pending, completed, cancelled
  occurredAt   DateTime @map("occurred_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  wallet     Wallet      @relation(fields: [walletId], references: [id])
  category   Category    @relation(fields: [categoryId], references: [id])
  recurrence Recurrence? @relation(fields: [recurrenceId], references: [id])

  @@map("transactions")
}

model Recurrence {
  id              String    @id @default(uuid())
  walletId        String    @map("wallet_id")
  categoryId      String    @map("category_id")
  type            String    // income, expense
  amount          Decimal   @db.Decimal(15, 2)
  description     String?
  period          String    // daily, weekly, monthly, yearly
  startsAt        DateTime  @map("starts_at")
  endsAt          DateTime? @map("ends_at")
  lastProcessedAt DateTime? @map("last_processed_at")

  createdAt DateTime @default(now()) @map("created_at")

  wallet       Wallet        @relation(fields: [walletId], references: [id])
  category     Category      @relation(fields: [categoryId], references: [id])
  transactions Transaction[]

  @@map("recurrences")
}
```

---

## Comandos Prisma

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Gerar Prisma Client após mudança no schema
npx prisma generate

# Visualizar banco (Prisma Studio)
npx prisma studio

# Reset completo (dev only)
npx prisma migrate reset
```

---

## Regras

- **Sempre** modificar `schema.prisma` antes de qualquer código de domínio.
- **Nunca** alterar o banco diretamente via SQL — usar migrations.
- Soft delete: adicionar `deletedAt DateTime?` e filtrar com `deleted_at IS NULL`.
- Decimais financeiros: sempre `@db.Decimal(15, 2)`.
- UUIDs: sempre `@default(uuid())`.
- Timestamps: `@default(now())` para `createdAt`, `@updatedAt` para `updatedAt`.
