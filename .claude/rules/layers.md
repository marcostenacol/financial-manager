# Padrões por camada (API)

> Localização: `src/modules/{modulo}/{camada}/`. Ex.: `src/modules/wallets/services/CreateWalletService.ts`.

## DTO (Zod)

```typescript
import { z } from 'zod';
import { TransactionTypeEnum } from '../enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';

export const CreateTransactionDTO = z.object({
  wallet_id: z.string().uuid('ID da carteira inválido'),
  category_id: z.string().uuid('ID da categoria inválido'),
  type: z.nativeEnum(TransactionTypeEnum),
  amount: z.number().positive('O valor deve ser maior que zero'),
  description: z.string().optional(),
  status: z.nativeEnum(TransactionStatusEnum).default(TransactionStatusEnum.COMPLETED),
  occurred_at: z.string().datetime().or(z.date()).default(() => new Date()),
});

export type CreateTransactionDTOType = z.infer<typeof CreateTransactionDTO>;
```

- Campos do DTO em `snake_case` (contrato de request/response da API é `snake_case` — ver `rules/naming.md`).
- Sempre exportar `{Ação}{Entidade}DTO` (o schema Zod) **e** `{Ação}{Entidade}DTOType` (`z.infer`) — é o par usado em todo módulo hoje.
- Mensagens de erro do `.uuid(...)`/`.min(...)` etc. em português — são o que o usuário vê via `ErrorHandler` (`ZodError → error.flatten().fieldErrors`).
- Enums de domínio (`TransactionTypeEnum`, `WalletTypeEnum`...) ficam em `enums/` dentro do módulo e são usados com `z.nativeEnum(...)`, nunca string literal solta no schema.
- Convivem hoje dois padrões de nome de arquivo (`CreateTransactionDTO.ts` sem prefixo, `ICreateSavingsGoalDTO.ts` com prefixo `I`) — para DTO novo, use a forma **sem prefixo `I`** (majoritária, e a única documentada em `.agents/docs/backend/STANDARDS.md`); não renomeie os arquivos com `I` existentes sem pedido.

## Repository

```typescript
import { Transaction, Prisma } from '@prisma/client';
import { TransactionRepositoryInterface } from './contracts/TransactionRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class TransactionRepository implements TransactionRepositoryInterface {
  async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
    return prisma.transaction.create({ data });
  }

  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: { category: true, wallet: true },
    });
  }
}
```

- Interface correspondente em `repositories/contracts/{Modulo}RepositoryInterface.ts` — o Service depende da interface via `@inject('{Modulo}Repository')`, nunca da classe concreta.
- Tipar o retorno com o tipo gerado pelo Prisma (`Transaction`, `Wallet`...), nunca `any`/`mixed`.
- Usar `Prisma.{Model}UncheckedCreateInput`/`UncheckedUpdateInput` para os parâmetros de escrita — é o padrão real usado (permite passar FK como campo escalar, ex. `walletId`, sem montar o objeto de relação aninhado).
- **Há dois padrões reais convivendo para acesso ao Prisma** (ver `CLAUDE.md` > Débito Técnico #1): `AuthRepository`/`WalletRepository`/`ProfileRepository` estendem `BaseRepository` e usam `this.prisma`; os demais importam `prisma` direto de `@/shared/database/PrismaClient`. Ao criar um Repository novo, prefira importar `prisma` direto (é o padrão majoritário hoje), mas não é uma regra fechada — sinalize a inconsistência se for relevante para a tarefa.
- Para listagens/relatórios que precisam de SQL mais complexo, o padrão documentado (mas pouco usado ainda no código real — só `ReportRepository` faz algo parecido) é `prisma.$queryRaw` com CTEs. **Nunca** interpolar valor em SQL cru — usar sempre os placeholders com tag template do Prisma (`` prisma.$queryRaw`... WHERE id = ${id}::uuid` ``), nunca concatenação de string.

## Service

```typescript
import { inject, injectable } from 'tsyringe';
import { Transaction } from '@prisma/client';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { CreateTransactionDTOType } from '../dtos/CreateTransactionDTO';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class CreateTransactionService {
  constructor(
    @inject('TransactionRepository') private transactionRepository: TransactionRepositoryInterface,
    @inject('WalletRepository') private walletRepository: WalletRepositoryInterface,
    private cache: CacheTrait,
  ) {}

  async execute(data: CreateTransactionDTOType, userId: string): Promise<Transaction> {
    const wallet = await this.walletRepository.findById(data.wallet_id);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const transaction = await this.transactionRepository.create({
      ...data,
      occurredAt: new Date(data.occurred_at),
    });

    await this.cache.del(`transactions:wallet:${wallet.id}`);
    await this.cache.del(`transactions:user:${userId}`);

    return transaction;
  }
}
```

- Método principal sempre `execute()`. Um Service = uma ação (`Create`, `Update`, `Delete`, `List`, `Detail`/`Get`...).
- Injeção via construtor (`@inject('{Nome}Repository')` / `@inject('{Nome}Service')`), registrado em `src/shared/container/index.ts`. `CacheTrait` é injetado sem string de token (`private cache: CacheTrait` direto) — funciona porque `CacheTrait` está registrado como singleton com o próprio nome da classe.
- Checagem de posse/escopo do dado (`wallet.userId !== userId`) é feita **no Service**, não no Repository — o Repository não conhece regra de negócio, só o dado.
- Invalidação de cache (`cache.del(...)`) é responsabilidade do Service que fez a escrita, chamada explicitamente após a operação, sem uma trigger/hook automático.
- Ao converter campo `snake_case` do DTO para o campo camelCase esperado pelo Prisma (`occurred_at` → `occurredAt`), a conversão é manual dentro do Service — não existe mapper genérico. Fazer isso comparando o schema Zod com o `schema.prisma` do modelo antes de escrever a chamada ao Repository, para não esquecer um campo.

## Controller

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateTransactionService } from '../services/CreateTransactionService';
import { CreateTransferSchema } from '../dtos/ICreateTransferDTO';

@injectable()
export class TransactionController extends BaseController {
  constructor(
    @inject('CreateTransactionService') private createTransaction: CreateTransactionService,
  ) {
    super();
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const transaction = await this.createTransaction.execute(data, userId);
    return this.success(reply, transaction, 'Transação criada com sucesso', 201);
  }

  async transfer(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as any).sub;
    const data = CreateTransferSchema.parse(request.body);

    await this.transferService.execute(data, userId);
    return this.success(reply, null, 'Transferência realizada com sucesso');
  }
}
```

- Estende `BaseController`, chama `super()` no construtor.
- `this.success(reply, data, message?, status_code?)` / `this.error(reply, message, status_code?)` — nunca `reply.send()`/`reply.status().send()` direto num Controller de domínio.
- `(request.user as any).sub` é o padrão real para obter o `userId` autenticado (populado pelo `@fastify/jwt` após `jwtVerify()` no `AuthMiddleware`).
- **Preferência**: validar o body com `{DTO}.parse(request.body)` (como em `transfer()`, usando o schema Zod) em vez de `request.body as any` — mas note que a maioria dos métodos existentes (`store`, `update`, `index`) hoje usa o cast `as any` mesmo já existindo um DTO Zod correspondente (ver `CLAUDE.md` > Débito Técnico #8). Escreva controller novo validando com o schema; não é preciso corrigir os métodos existentes por tocar o arquivo.
- Services injetados no construtor (não no método, diferente do padrão do projeto de referência GIZ) — é assim que a DI do tsyringe funciona aqui.

## Rotas

```typescript
import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TransactionController } from './controllers/TransactionController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function transactionRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(TransactionController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', (request, reply) => controller.index(request, reply));
  fastify.post('/', (request, reply) => controller.store(request, reply));
  fastify.post('/transfer', (request, reply) => controller.transfer(request, reply));
}
```

- Um arquivo `routes.ts` por módulo, exportando uma função `async function {modulo}Routes(fastify)`.
- `fastify.addHook('preHandler', authMiddleware)` protege todas as rotas do módulo de uma vez (padrão da maioria); para rotas mistas (algumas públicas, outras não) usar `{ preHandler: [authMiddleware] }` só na rota específica, como em `auth/routes.ts` (`register`/`login`/`refresh` públicas, `logout` protegida).
- Registro do prefixo (`/api/v1/{modulo}`) é feito centralmente em `src/app.ts`, não dentro do próprio `routes.ts`.
- Handler como arrow function `(request, reply) => controller.metodo(request, reply)` é o padrão majoritário; `controller.metodo.bind(controller)` aparece em `auth/routes.ts` — ambos funcionam, prefira o primeiro por ser o mais usado.
