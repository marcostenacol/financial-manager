# Repositories — Persistência com Prisma + CTEs

## Papel

O Repository é a camada de **persistência** do módulo. Ele:

1. Abstrai o acesso ao banco de dados.
2. Usa **Prisma** para CRUD simples.
3. Usa **`prisma.$queryRaw` com CTEs** para queries complexas.
4. **Nunca** contém regra de negócio.

---

## BaseRepository

```typescript
// src/base/repository/BaseRepository.ts
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'tsyringe';

export abstract class BaseRepository {
  constructor(
    @inject('PrismaClient') protected prisma: PrismaClient,
  ) {}
}
```

---

## Interface do Repository (Contrato)

```typescript
// src/modules/wallet/repositories/contracts/WalletRepositoryInterface.ts
import { Wallet } from '@prisma/client';
import { CreateWalletData } from '../WalletRepository';

export interface WalletRepositoryInterface {
  create(data: CreateWalletData): Promise<Wallet>;
  findById(id: string): Promise<Wallet | null>;
  findAllByUser(user_id: string): Promise<Wallet[]>;
  countByUser(user_id: string): Promise<number>;
  update(id: string, data: Partial<CreateWalletData>): Promise<Wallet>;
  softDelete(id: string): Promise<void>;
  updateBalance(id: string, amount: number): Promise<void>;
}
```

---

## Implementação do Repository

### CRUD Simples (Prisma)

```typescript
// src/modules/wallet/repositories/WalletRepository.ts
import { Wallet } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { BaseRepository } from '@/base/repository/BaseRepository';
import { WalletRepositoryInterface } from './contracts/WalletRepositoryInterface';

export interface CreateWalletData {
  user_id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

@injectable()
export class WalletRepository extends BaseRepository implements WalletRepositoryInterface {
  async create(data: CreateWalletData): Promise<Wallet> {
    return this.prisma.wallet.create({ data });
  }

  async findById(id: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { id, deleted_at: null },
    });
  }

  async findAllByUser(user_id: string): Promise<Wallet[]> {
    return this.prisma.wallet.findMany({
      where: { user_id, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  async countByUser(user_id: string): Promise<number> {
    return this.prisma.wallet.count({
      where: { user_id, deleted_at: null },
    });
  }

  async update(id: string, data: Partial<CreateWalletData>): Promise<Wallet> {
    return this.prisma.wallet.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.wallet.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async updateBalance(id: string, delta: number): Promise<void> {
    await this.prisma.wallet.update({
      where: { id },
      data: { balance: { increment: delta } },
    });
  }
}
```

---

### Queries Complexas (CTEs via `prisma.$queryRaw`)

Use CTEs para listagens com filtros dinâmicos, joins múltiplos ou relatórios:

```typescript
// src/modules/transaction/repositories/TransactionRepository.ts
async listWithFilters(params: TransactionFilters): Promise<TransactionRow[]> {
  const { wallet_id, type, status, page, limit } = params;
  const offset = (page - 1) * limit;

  return this.prisma.$queryRaw<TransactionRow[]>`
    WITH base_transactions AS (
      SELECT
        t.id,
        t.type,
        t.amount,
        t.description,
        t.status,
        t.occurred_at,
        c.name AS category_name,
        c.color AS category_color,
        c.icon  AS category_icon
      FROM transactions t
      INNER JOIN categories c ON c.id = t.category_id
      WHERE t.wallet_id = ${wallet_id}::uuid
        AND t.deleted_at IS NULL
        ${type ? Prisma.sql`AND t.type = ${type}` : Prisma.empty}
        ${status ? Prisma.sql`AND t.status = ${status}` : Prisma.empty}
      ORDER BY t.occurred_at DESC
    ),
    paginated AS (
      SELECT * FROM base_transactions
      LIMIT ${limit} OFFSET ${offset}
    ),
    total_count AS (
      SELECT COUNT(*) AS total FROM base_transactions
    )
    SELECT
      p.*,
      tc.total
    FROM paginated p
    CROSS JOIN total_count tc
  `;
}
```

---

### Transações Atômicas (Prisma Transaction)

```typescript
async createTransfer(data: TransferData): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // Cria transação de débito
    await tx.transaction.create({
      data: {
        wallet_id: data.source_wallet_id,
        type: 'expense',
        amount: data.amount,
        status: 'completed',
        occurred_at: new Date(),
      },
    });

    // Cria transação de crédito
    await tx.transaction.create({
      data: {
        wallet_id: data.target_wallet_id,
        type: 'income',
        amount: data.amount,
        status: 'completed',
        occurred_at: new Date(),
      },
    });

    // Atualiza saldos
    await tx.wallet.update({
      where: { id: data.source_wallet_id },
      data: { balance: { decrement: data.amount } },
    });
    await tx.wallet.update({
      where: { id: data.target_wallet_id },
      data: { balance: { increment: data.amount } },
    });
  });
}
```

---

## Regras

- Sempre extende `BaseRepository`.
- Sempre implementa a interface correspondente (`XRepositoryInterface`).
- CRUD simples → Prisma methods (`findUnique`, `create`, `update`, `delete`).
- Queries com múltiplos joins ou filtros dinâmicos → `prisma.$queryRaw` com CTEs.
- Relatórios → obrigatoriamente CTEs.
- Soft delete: `deleted_at = new Date()` (coluna opcional no schema).
- Operações atômicas: `prisma.$transaction(async (tx) => { ... })`.
- Nunca coloca regra de negócio (ex: validar limite, calcular saldo) no Repository.
- Registrar no container como Singleton: `container.registerSingleton('WalletRepository', WalletRepository)`.
