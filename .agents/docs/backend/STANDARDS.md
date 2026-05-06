# Padrões Globais do Backend — STANDARDS

## 1. Linguagem e Tipagem

- **TypeScript 5** com `strict: true` no `tsconfig.json`.
- Nunca usar `any` implícito. Prefira `unknown` quando necessário e faça type narrowing.
- Toda função pública deve ter tipos de parâmetros e retorno explícitos.
- Enums de domínio ficam em `enums/` dentro do módulo — nunca strings literais avulsas.

## 2. Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Variáveis e parâmetros | `snake_case` | `user_id`, `wallet_balance` |
| Métodos e funções | `camelCase` | `execute()`, `findById()` |
| Classes | `PascalCase` | `CreateWalletService` |
| Interfaces | `PascalCase` com sufixo `Interface` | `WalletRepositoryInterface` |
| Enums | `PascalCase` com sufixo `Enum` | `WalletTypeEnum` |
| DTOs | `PascalCase` com sufixo `DTO` | `CreateWalletDTO` |
| Arquivos | `PascalCase.ts` para classes, `camelCase.ts` para utilitários | `WalletController.ts` |
| Banco (Prisma `@map`) | `snake_case` | `wallet_id`, `created_at` |

## 3. Estrutura de Arquivo de Módulo

Todo módulo segue esta estrutura interna:

```
src/modules/{modulo}/
├── controllers/        → Fastify handlers
├── dtos/               → Zod schemas de entrada
├── enums/              → Constantes de domínio
├── repositories/
│   ├── contracts/      → Interfaces TypeScript
│   └── {Modulo}Repository.ts
├── services/           → Um arquivo por caso de uso
└── routes.ts           → Registro de rotas Fastify
```

## 4. Services — Método Execute

Todo Service tem **um único método público**: `execute`.

```typescript
@injectable()
export class CreateWalletService {
  constructor(
    @inject('WalletRepository') private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait') private cache: CacheTrait,
  ) {}

  async execute(dto: CreateWalletDTOType): Promise<WalletResponse> {
    // regra de negócio aqui
  }
}
```

## 5. Controllers — Padrão de Resposta

```typescript
export class WalletController extends BaseController {
  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = CreateWalletDTO.parse(request.body);
    const result = await this.create_wallet_service.execute(dto);
    return this.success(reply, result, 'Carteira criada com sucesso', 201);
  }
}
```

## 6. Repositories — Separação Prisma/SQL

- **CRUD simples** → use métodos Prisma (`findUnique`, `create`, `update`, `delete`).
- **Listagens complexas com filtros** → use `prisma.$queryRaw` com CTEs.
- **Relatórios** → obrigatoriamente CTEs via `prisma.$queryRaw`.

```typescript
// Simples
async findById(id: string): Promise<Wallet | null> {
  return this.prisma.wallet.findUnique({ where: { id } });
}

// CTE para listagem com filtros
async listWithFilters(user_id: string, filters: ListFilters): Promise<WalletRow[]> {
  return this.prisma.$queryRaw`
    WITH filtered_wallets AS (
      SELECT * FROM wallets
      WHERE user_id = ${user_id}::uuid
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${filters.limit} OFFSET ${filters.offset}
    )
    SELECT * FROM filtered_wallets
  `;
}
```

## 7. Erros

Use sempre `AppError` para erros de negócio:

```typescript
import { AppError } from '@/shared/errors/AppError';

throw new AppError('Carteira não encontrada', 404);
```

O `ErrorHandler.ts` captura globalmente e formata a resposta.

## 8. Cache

Toda listagem deve usar cache. Padrão de chave:

| Recurso | Chave |
|---------|-------|
| Carteiras do usuário | `wallets:user:{user_id}` |
| Detalhe de carteira | `wallet:{wallet_id}` |
| Transações de carteira | `transactions:wallet:{wallet_id}:page:{page}` |
| Categorias do usuário | `categories:user:{user_id}` |
| Perfil do usuário | `profile:user:{user_id}` |
| Token de auth | `auth:token:{user_id}` |

TTL padrão: 300s (5 min). Relatórios: 60s.

## 9. DTOs com Zod

```typescript
import { z } from 'zod';

export const CreateWalletDTO = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(WalletTypeEnum),
  currency: z.string().default('BRL'),
});

export type CreateWalletDTOType = z.infer<typeof CreateWalletDTO>;
```

## 10. Rotas — Prefixo e Auth

```typescript
export async function walletRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/wallets', { schema: createWalletSchema }, walletController.create);
  fastify.get('/wallets', { schema: listWalletsSchema }, walletController.list);
  fastify.get('/wallets/:id', { schema: detailWalletSchema }, walletController.detail);
}
```

Prefixo global: `/api/v1` registrado em `app.ts`.

## 11. Injeção de Dependência (tsyringe)

- Todo Service e Repository deve ser `@injectable()`.
- Registrar no container em `src/shared/container/index.ts`.
- Controller recebe instâncias pelo container via `container.resolve(WalletController)`.

## 12. Testes

- Arquivo por caso de uso: `tests/{modulo}/{acao}.test.ts`.
- Helper de auth: `tests/helpers/authenticatesForTesting.ts`.
- Usar Supertest para chamadas HTTP de integração.
- Banco de testes isolado (variável de ambiente `DATABASE_URL_TEST`).
- **Nunca** rodar testes automaticamente — sempre recomendar ao usuário.
