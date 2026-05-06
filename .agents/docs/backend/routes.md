# Routes — Registro de Rotas no Fastify

## Papel

Cada módulo tem seu próprio `routes.ts` que registra os endpoints Fastify. O arquivo de rotas:

1. Define os endpoints (`GET`, `POST`, `PUT`, `DELETE`).
2. Aplica middlewares via `preHandler`.
3. Associa handlers do Controller.
4. Define `schema` para Swagger automático.

---

## Padrão de routes.ts

```typescript
// src/modules/wallet/routes.ts
import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { WalletController } from './controllers/WalletController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function walletRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(WalletController);

  fastify.addHook('preHandler', authMiddleware);

  fastify.post('/wallets', {
    schema: {
      tags: ['Wallet'],
      summary: 'Criar nova carteira',
      body: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['personal', 'business'] },
          currency: { type: 'string', default: 'BRL' },
        },
      },
    },
  }, controller.create.bind(controller));

  fastify.get('/wallets', {
    schema: {
      tags: ['Wallet'],
      summary: 'Listar carteiras do usuário',
    },
  }, controller.list.bind(controller));

  fastify.get('/wallets/:id', {
    schema: {
      tags: ['Wallet'],
      summary: 'Detalhar carteira',
      params: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
      },
    },
  }, controller.detail.bind(controller));

  fastify.put('/wallets/:id', {
    schema: {
      tags: ['Wallet'],
      summary: 'Atualizar carteira',
    },
  }, controller.update.bind(controller));

  fastify.delete('/wallets/:id', {
    schema: {
      tags: ['Wallet'],
      summary: 'Deletar carteira (soft delete)',
    },
  }, controller.destroy.bind(controller));
}
```

---

## Registro Central (app.ts)

```typescript
// src/app.ts
import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { authRoutes } from './modules/auth/routes';
import { profileRoutes } from './modules/profile/routes';
import { walletRoutes } from './modules/wallet/routes';
import { transactionRoutes } from './modules/transaction/routes';
import { categoryRoutes } from './modules/category/routes';
import { recurrenceRoutes } from './modules/recurrence/routes';
import { reportRoutes } from './modules/report/routes';
import { errorHandler } from './shared/errors/ErrorHandler';

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Swagger
  await app.register(swagger, { openapi: { info: { title: 'Financial API', version: '1.0.0' } } });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  // Rotas — prefixo global /api/v1
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(profileRoutes, { prefix: '/api/v1' });
  await app.register(walletRoutes, { prefix: '/api/v1' });
  await app.register(transactionRoutes, { prefix: '/api/v1' });
  await app.register(categoryRoutes, { prefix: '/api/v1' });
  await app.register(recurrenceRoutes, { prefix: '/api/v1' });
  await app.register(reportRoutes, { prefix: '/api/v1' });

  // Error handler global
  app.setErrorHandler(errorHandler);

  return app;
}
```

---

## Rotas de Auth (sem middleware)

```typescript
// src/modules/auth/routes.ts
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(AuthController);

  // Sem authMiddleware — endpoints públicos
  fastify.post('/auth/register', controller.register.bind(controller));
  fastify.post('/auth/login', controller.login.bind(controller));
  fastify.post('/auth/refresh', controller.refresh.bind(controller));

  // Com authMiddleware
  fastify.post('/auth/logout', {
    preHandler: [authMiddleware],
  }, controller.logout.bind(controller));
}
```

---

## Endpoints por Módulo

| Módulo | Método | Endpoint | Auth |
|--------|--------|----------|------|
| Auth | POST | `/api/v1/auth/register` | ❌ |
| Auth | POST | `/api/v1/auth/login` | ❌ |
| Auth | POST | `/api/v1/auth/logout` | ✅ |
| Auth | POST | `/api/v1/auth/refresh` | ❌ |
| Profile | GET | `/api/v1/profile` | ✅ |
| Profile | PUT | `/api/v1/profile` | ✅ |
| Profile | POST | `/api/v1/profile/avatar` | ✅ |
| Wallet | GET | `/api/v1/wallets` | ✅ |
| Wallet | POST | `/api/v1/wallets` | ✅ |
| Wallet | GET | `/api/v1/wallets/:id` | ✅ |
| Wallet | PUT | `/api/v1/wallets/:id` | ✅ |
| Wallet | DELETE | `/api/v1/wallets/:id` | ✅ |
| Transaction | GET | `/api/v1/transactions` | ✅ |
| Transaction | POST | `/api/v1/transactions` | ✅ |
| Transaction | GET | `/api/v1/transactions/:id` | ✅ |
| Transaction | PUT | `/api/v1/transactions/:id` | ✅ |
| Transaction | DELETE | `/api/v1/transactions/:id` | ✅ |
| Transaction | POST | `/api/v1/transactions/transfer` | ✅ |
| Category | GET | `/api/v1/categories` | ✅ |
| Category | POST | `/api/v1/categories` | ✅ |
| Category | PUT | `/api/v1/categories/:id` | ✅ |
| Category | DELETE | `/api/v1/categories/:id` | ✅ |
| Recurrence | GET | `/api/v1/recurrences` | ✅ |
| Recurrence | POST | `/api/v1/recurrences` | ✅ |
| Recurrence | DELETE | `/api/v1/recurrences/:id` | ✅ |
| Report | GET | `/api/v1/reports/balance` | ✅ |
| Report | GET | `/api/v1/reports/expenses-by-category` | ✅ |
| Report | GET | `/api/v1/reports/monthly-evolution` | ✅ |

---

## Regras

- Todo endpoint autenticado usa `preHandler: [authMiddleware]` ou `addHook('preHandler', ...)`.
- Prefixo global: `/api/v1` registrado em `app.ts`.
- Nunca colocar lógica de negócio no routes.ts.
- Controller sempre recebido via `container.resolve()`.
- Sempre usar `.bind(controller)` para preservar o `this`.
- Schema Swagger definido inline para geração automática de docs.
