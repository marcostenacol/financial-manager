# Services — Lógica de Negócio

## Papel

O Service é a camada de **lógica de negócio** do módulo. Ele:

1. Recebe um DTO tipado do Controller.
2. Executa as regras de negócio do caso de uso.
3. Orquestra chamadas ao Repository e ao Cache.
4. Retorna um resultado tipado.

**Nunca** conhece HTTP, `FastifyRequest`, `FastifyReply` ou detalhes de banco.

---

## Padrão: Um Service por Caso de Uso

```typescript
// src/modules/wallet/services/CreateWalletService.ts
import { injectable, inject } from 'tsyringe';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CreateWalletDTOType } from '../dtos/CreateWalletDTO';
import { AppError } from '@/shared/errors/AppError';
import { Wallet } from '@prisma/client';

@injectable()
export class CreateWalletService {
  constructor(
    @inject('WalletRepository') private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait') private cache: CacheTrait,
  ) {}

  async execute(dto: CreateWalletDTOType & { user_id: string }): Promise<Wallet> {
    // Regra: limite de carteiras por usuário
    const existing_count = await this.wallet_repository.countByUser(dto.user_id);
    if (existing_count >= 10) {
      throw new AppError('Limite de 10 carteiras por usuário atingido', 422);
    }

    const wallet = await this.wallet_repository.create({
      user_id: dto.user_id,
      name: dto.name,
      type: dto.type,
      currency: dto.currency ?? 'BRL',
      balance: 0,
    });

    // Invalida cache da listagem do usuário
    await this.cache.del(`wallets:user:${dto.user_id}`);

    return wallet;
  }
}
```

---

## Services com Cache (Listagem/Detalhe)

```typescript
// src/modules/wallet/services/ListWalletsService.ts
@injectable()
export class ListWalletsService {
  constructor(
    @inject('WalletRepository') private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait') private cache: CacheTrait,
  ) {}

  async execute({ user_id }: { user_id: string }): Promise<Wallet[]> {
    const cache_key = `wallets:user:${user_id}`;
    const cached = await this.cache.get<Wallet[]>(cache_key);
    if (cached) return cached;

    const wallets = await this.wallet_repository.findAllByUser(user_id);
    await this.cache.set(cache_key, wallets, 300);

    return wallets;
  }
}
```

---

## Services com Operações Atômicas (Transaction/Transfer)

Operações que afetam múltiplas entidades devem usar transação Prisma:

```typescript
// src/modules/transaction/services/TransferService.ts
@injectable()
export class TransferService {
  constructor(
    @inject('TransactionRepository') private transaction_repository: TransactionRepositoryInterface,
    @inject('WalletRepository') private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait') private cache: CacheTrait,
  ) {}

  async execute(dto: TransferDTOType): Promise<void> {
    const source_wallet = await this.wallet_repository.findById(dto.source_wallet_id);
    if (!source_wallet) throw new AppError('Carteira de origem não encontrada', 404);
    if (source_wallet.balance < dto.amount) throw new AppError('Saldo insuficiente', 422);

    // Duas transações atomicamente via Prisma transaction
    await this.transaction_repository.createTransfer({
      source_wallet_id: dto.source_wallet_id,
      target_wallet_id: dto.target_wallet_id,
      amount: dto.amount,
      description: dto.description,
    });

    // Invalida cache das duas carteiras
    await this.cache.del(`wallet:${dto.source_wallet_id}`);
    await this.cache.del(`wallet:${dto.target_wallet_id}`);
  }
}
```

---

## Services de Jobs (ProcessRecurrenceService)

```typescript
// src/modules/recurrence/services/ProcessRecurrenceService.ts
@injectable()
export class ProcessRecurrenceService {
  constructor(
    @inject('RecurrenceRepository') private recurrence_repository: RecurrenceRepositoryInterface,
    @inject('TransactionRepository') private transaction_repository: TransactionRepositoryInterface,
  ) {}

  async execute(): Promise<void> {
    const pending = await this.recurrence_repository.findPendingToProcess();

    for (const recurrence of pending) {
      await this.transaction_repository.create({
        wallet_id: recurrence.wallet_id,
        category_id: recurrence.category_id,
        recurrence_id: recurrence.id,
        type: recurrence.type,
        amount: recurrence.amount,
        description: recurrence.description,
        status: 'completed',
        occurred_at: new Date(),
      });

      await this.recurrence_repository.updateLastProcessed(recurrence.id);
    }
  }
}
```

---

## Regras

- Método único público: `execute(dto)`.
- Sempre `@injectable()` para DI via tsyringe.
- Nunca acessa `Prisma` diretamente — usa o Repository.
- Nunca formata resposta HTTP — isso é papel do Controller.
- Erros de negócio: `throw new AppError(message, statusCode)`.
- Invalida cache sempre que criar, atualizar ou deletar.
- Operações atômicas usam transação Prisma (via Repository).
