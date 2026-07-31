# Arquitetura

## API (`financial-manager-api/`)

Fluxo obrigatório:

```
Route → Controller → Service → Repository → Prisma
                ↕           ↕
               DTO       (schema.prisma)
```

- **Route** (`src/modules/{modulo}/routes.ts`): registra os handlers Fastify, resolve o Controller via `container.resolve(...)`, aplica `authMiddleware` via `fastify.addHook('preHandler', authMiddleware)` (aplica a todas as rotas do módulo) ou `{ preHandler: [authMiddleware] }` por rota individual (usado em `auth/routes.ts` só na rota de `logout`, já que `register`/`login`/`refresh` são públicas).
- **Controller** (`src/modules/{modulo}/controllers/`): estende `BaseController`, é `@injectable()`, recebe os Services por `@inject()` no construtor. Sem lógica de negócio, sem chamada a Prisma.
- **Service** (`src/modules/{modulo}/services/`): um arquivo por ação (`Create{Entidade}Service`, `Update{Entidade}Service`...), método público único `execute()`. Toda regra de negócio mora aqui, incluindo checagens de propriedade (ex.: `wallet.userId !== userId`) e invalidação de cache.
- **Repository** (`src/modules/{modulo}/repositories/`): acesso a dados via Prisma Client. Interface correspondente em `repositories/contracts/{Modulo}RepositoryInterface.ts`, usada para o `@inject()` no Service (inversão de dependência real, não só nominal — os Services dependem da interface, não da classe concreta).
- Não existe camada de "Model" separada — o "model" é o `schema.prisma` + os tipos gerados pelo Prisma Client (`Transaction`, `Wallet`, etc., importados de `@prisma/client`).
- Não existe camada de "Resource"/serializer — o Controller devolve o retorno do Service (objeto/array do Prisma) direto para `this.success(reply, data, message, status_code)`.

## Organização por módulo — 100% modular, sem legado flat

```
src/modules/{modulo}/
├── controllers/
├── dtos/
├── enums/                          (só quando há domínio fechado — ver TransactionStatusEnum/TransactionTypeEnum/WalletTypeEnum/RoleEnum)
├── repositories/
│   ├── contracts/{Modulo}RepositoryInterface.ts
│   └── {Modulo}Repository.ts
├── services/
└── routes.ts
```

Módulos existentes: `auth`, `profile`, `wallets`, `transactions`, `categories`, `recurrences`, `reports`, `savings-goals`, `notifications`. Todo módulo novo segue esta mesma estrutura — não há um "padrão legado" a preservar aqui como no projeto de referência GIZ; este projeto nasceu já modular.

## Base real (`src/base/`, `src/shared/`)

```
src/base/
├── http/BaseController.ts        # success()/error() sobre FastifyReply — REAL, todo Controller estende
├── repository/BaseRepository.ts  # só guarda this.prisma = prisma — usado por 3 de ~9 Repositories (ver CLAUDE.md > Débito Técnico)
└── traits/
    ├── Response.ts                # ResponseTrait.success()/error() — monta o envelope {success, message, data}
    └── CacheTrait.ts               # get/set/del/delPattern via Redis, @injectable()

src/shared/
├── container/index.ts             # registro central tsyringe — toda Repository/Service novo entra aqui
├── database/PrismaClient.ts       # singleton do PrismaClient
├── cache/RedisClient.ts            # cliente Redis (getRedisClient())
├── errors/
│   ├── AppError.ts                 # erro de negócio — NÃO estende Error nativo (ver débito técnico)
│   └── ErrorHandler.ts              # app.setErrorHandler — trata AppError, ZodError, e cai em 500 genérico
├── middlewares/AuthMiddleware.ts    # valida JWT (jwtVerify); checagem de sessão em Redis existe mas não bloqueia hoje
└── infra/jobs/RecurrenceJob.ts       # node-cron — processamento de recorrências
```

Diferente do projeto de referência GIZ (`RestfulController`/`RestfulService` = scaffold morto e claramente marcado como tal), aqui `BaseController` é 100% vivo e usado por todo Controller; `BaseRepository`, porém, está num estado intermediário — nem morto nem universal (ver débito técnico no `CLAUDE.md`).

## UI (`financial-manager-ui/`)

```
src/modules/{modulo}/
├── components/     # modais/formulários específicos do módulo (Create{Entidade}Modal, Update{Entidade}Modal)
└── pages/          # {Modulo}Page.tsx — uma página por módulo, monta os dados chamando `api` direto
src/shared/components/
├── Layout/DefaultLayout.tsx
├── Sidebar.tsx
└── Toast.tsx
src/services/api.ts    # instância única do axios + interceptors de access/refresh token
src/contexts/AuthContext.tsx   # signIn/signOut/updateUser, storage em localStorage (@FinancialManager:*)
src/routes/index.tsx      # todas as rotas + ProtectedRoute inline (não há arquivo de rotas por módulo)
```

Não há camada de serviço (`src/modules/{modulo}/services.ts`) nem hooks de dados (`useWallets()`) — cada página/componente chama `api.get/post/put/delete(...)` diretamente. Isso é uma lacuna real (ver `CLAUDE.md` > Débito Técnico, item 10), não um padrão a copiar cegamente ao crescer o projeto, mas também não é algo a "corrigir" sem que seja pedido.
