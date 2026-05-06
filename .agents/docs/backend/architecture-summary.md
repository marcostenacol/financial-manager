# Architecture Summary — Sistema Financeiro

## Visão Geral

Sistema financeiro pessoal e empresarial construído como uma **API REST modular** com Node.js 20 + TypeScript 5 + Fastify 4. Cada domínio é isolado em `src/modules/{dominio}/`, compartilhando apenas utilitários da camada `src/base/` e `src/shared/`.

---

## Fluxo de Request

```
Client HTTP
    ↓
Fastify Route (src/modules/{modulo}/routes.ts)
    ↓
Middlewares (AuthMiddleware, PermissionMiddleware)
    ↓
Controller (src/modules/{modulo}/controllers/{Modulo}Controller.ts)
    → valida DTO (Zod)
    → delega ao Service
    → formata resposta via Response.ts
    ↓
Service (src/modules/{modulo}/services/{Acao}{Modulo}Service.ts)
    → regra de negócio
    → orquestra Repository + Cache
    ↓
Repository (src/modules/{modulo}/repositories/{Modulo}Repository.ts)
    → Prisma (CRUD simples)
    → prisma.$queryRaw com CTEs (queries complexas)
    ↓
PostgreSQL 16 / Redis 7
```

---

## Estrutura de Pastas Completa

```
financial/
├── .docker/
│   ├── postgres/
│   ├── redis/
│   └── nginx/
│       └── conf.d/
│           ├── app.local.conf
│           └── app.prod.conf
│
├── prisma/
│   ├── schema.prisma          ← fonte da verdade do banco
│   └── migrations/
│
├── src/
│   ├── base/                  ← abstrações base reutilizáveis
│   │   ├── http/
│   │   │   └── BaseController.ts
│   │   ├── repository/
│   │   │   └── BaseRepository.ts
│   │   └── traits/
│   │       ├── Response.ts    ← padronização { success, message, data }
│   │       └── CacheTrait.ts  ← abstração Redis
│   │
│   ├── modules/               ← domínios isolados
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── wallet/
│   │   ├── transaction/
│   │   ├── category/
│   │   ├── recurrence/
│   │   └── report/
│   │
│   ├── shared/                ← utilitários transversais
│   │   ├── cache/
│   │   │   └── RedisClient.ts
│   │   ├── middlewares/
│   │   │   ├── AuthMiddleware.ts
│   │   │   └── PermissionMiddleware.ts
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── ErrorHandler.ts
│   │   └── container/
│   │       └── index.ts       ← tsyringe DI container
│   │
│   ├── app.ts                 ← configura Fastify + plugins + rotas
│   └── server.ts              ← inicia servidor + node-cron jobs
│
├── tests/
│   ├── auth/
│   ├── wallet/
│   ├── transaction/
│   └── helpers/
│       └── authenticatesForTesting.ts
│
└── prisma/schema.prisma
```

---

## Módulos do Sistema

| Módulo | Domínio | Cache | CTE |
|--------|---------|-------|-----|
| `auth` | Autenticação JWT | ✅ (token em Redis) | ❌ |
| `profile` | Perfil do usuário | ✅ por `user_id` | ❌ |
| `wallet` | Carteiras | ✅ por `user_id` | ❌ |
| `transaction` | Transações | ✅ por `wallet_id` | ✅ (listagem) |
| `category` | Categorias | ✅ global + por `user_id` | ❌ |
| `recurrence` | Recorrências | ✅ por `wallet_id` | ❌ |
| `report` | Relatórios/Dashboards | ✅ (TTL curto) | ✅ (obrigatório) |

---

## Camadas e Responsabilidades

### Route (`routes.ts`)
- Registra endpoint Fastify com `fastify.get/post/put/delete`.
- Define `schema` Fastify para validação e Swagger automático.
- Aplica `preHandler` com middlewares de auth.
- Aponta para o método do Controller.

### Controller
- Extende `BaseController`.
- Recebe `FastifyRequest` e `FastifyReply`.
- Valida input com Zod DTO → lança `AppError` se inválido.
- Delega ao Service injetado via tsyringe.
- Retorna resposta via `this.response.success()` ou `this.response.error()`.
- **Nunca** acessa Prisma ou Repository diretamente.

### Service
- Decorado com `@injectable()`.
- Recebe dependências via `@inject()` no constructor.
- Método único: `async execute(dto: XDTO): Promise<Y>`.
- Contém toda a lógica de negócio.
- Chama Repository para persistência.
- Gerencia cache via `CacheTrait`.
- Lança `AppError` para erros de negócio.

### Repository
- Extende `BaseRepository`.
- Decorado com `@injectable()`.
- Usa `PrismaClient` injetado.
- CRUD simples: usa métodos Prisma (`findMany`, `create`, etc.).
- Queries complexas: usa `prisma.$queryRaw` com CTEs tipadas.
- **Nunca** contém regra de negócio.

### DTO (Zod Schema)
- Define o contrato de entrada da API.
- Validação acontece no Controller antes de chamar o Service.
- Tipagem inferida com `z.infer<typeof CreateXDTO>`.

---

## Padrão de Resposta JSON

```typescript
// Sucesso
{ success: true, message: "Operação realizada", data: { ... } }

// Erro de negócio (4xx)
{ success: false, message: "Mensagem descritiva", data: null }

// Erro interno (5xx)
{ success: false, message: "Erro interno", data: null }
```

---

## Injeção de Dependência (tsyringe)

```typescript
// Service
@injectable()
export class CreateWalletService {
  constructor(
    @inject('WalletRepository') private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait') private cache: CacheTrait,
  ) {}
}

// Container (src/shared/container/index.ts)
container.registerSingleton<WalletRepositoryInterface>('WalletRepository', WalletRepository);
```

---

## Autenticação

- Access token: JWT com curta validade (15min).
- Refresh token: salvo em `refresh_tokens` com `expires_at`.
- `AuthMiddleware` valida JWT → checa Redis → checa banco.
- Logout invalida refresh token: `expires_at = now()`.
- Token em Redis: `auth:token:{user_id}` com TTL igual ao JWT.
