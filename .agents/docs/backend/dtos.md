# DTOs — Validação de Entrada com Zod

## Papel

DTOs (Data Transfer Objects) definem o **contrato de entrada** de cada endpoint. No Fastify com TypeScript, usamos **Zod** para validação e inferência de tipos.

---

## Padrão de DTO

```typescript
// src/modules/wallet/dtos/CreateWalletDTO.ts
import { z } from 'zod';
import { WalletTypeEnum } from '../enums/WalletTypeEnum';

export const CreateWalletDTO = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.nativeEnum(WalletTypeEnum),
  currency: z.string().length(3).default('BRL'),
});

export type CreateWalletDTOType = z.infer<typeof CreateWalletDTO>;
```

---

## Uso no Controller

```typescript
async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  // Lança ZodError → capturado pelo ErrorHandler → 422
  const dto = CreateWalletDTO.parse(request.body);

  const wallet = await this.create_wallet_service.execute({
    ...dto,
    user_id: request.user.id,
  });

  return this.success(reply, wallet, 'Carteira criada', 201);
}
```

---

## DTOs por Módulo

### Auth

```typescript
// LoginDTO.ts
export const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// RegisterDTO.ts
export const RegisterDTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});
```

### Wallet

```typescript
// UpdateWalletDTO.ts
export const UpdateWalletDTO = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).optional(),
});
```

### Transaction

```typescript
// CreateTransactionDTO.ts
export const CreateTransactionDTO = z.object({
  wallet_id: z.string().uuid(),
  category_id: z.string().uuid(),
  type: z.nativeEnum(TransactionTypeEnum),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  status: z.nativeEnum(TransactionStatusEnum).default('completed'),
  occurred_at: z.string().datetime().optional(),
});
```

### Filtros de Listagem (Query Params)

```typescript
// ListTransactionsDTO.ts
export const ListTransactionsDTO = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.nativeEnum(TransactionTypeEnum).optional(),
  status: z.nativeEnum(TransactionStatusEnum).optional(),
  category_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});
```

---

## Enums nos DTOs

Sempre use `z.nativeEnum()` com enums TypeScript:

```typescript
// src/modules/wallet/enums/WalletTypeEnum.ts
export enum WalletTypeEnum {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

// No DTO:
type: z.nativeEnum(WalletTypeEnum)
```

---

## Regras

- Um arquivo DTO por operação: `Create{X}DTO.ts`, `Update{X}DTO.ts`, `List{X}DTO.ts`.
- Sempre exportar o schema Zod **e** o tipo inferido (`z.infer<typeof DTO>`).
- Usar `z.coerce` para query params numéricos (chegam como string na URL).
- Campos opcionais em updates: `.optional()`.
- Campos com default: `.default(valor)`.
- Validações de negócio simples (min/max, email, uuid) ficam no DTO.
- Validações de negócio complexas (ex: "carteira existe?") ficam no Service.
- Nunca duplicar validação entre DTO e Service.
