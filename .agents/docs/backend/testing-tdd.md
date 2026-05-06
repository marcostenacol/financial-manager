# Testes — Vitest + Supertest

## Stack de Testes

- **Vitest**: test runner e assertions.
- **Supertest**: chamadas HTTP de integração.
- **Banco de testes**: PostgreSQL separado, controlado via `.env.test`.

---

## Configuração

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
});
```

```typescript
// tests/setup.ts
import { execSync } from 'child_process';
import { buildApp } from '../src/app';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  // Reset banco de testes
  execSync('npx prisma migrate reset --force', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
  });
  app = await buildApp();
  await app.ready();
  (global as any).app = app;
});

afterAll(async () => {
  await app.close();
});
```

---

## Helper de Autenticação

```typescript
// tests/helpers/authenticatesForTesting.ts
import supertest from 'supertest';

export async function authenticatesForTesting(app: any): Promise<string> {
  const response = await supertest(app.server)
    .post('/api/v1/auth/login')
    .send({ email: 'test@test.com', password: 'password123' });

  return response.body.data.access_token;
}
```

---

## Padrão de Teste de Módulo

```typescript
// tests/wallet/create_wallet.test.ts
import supertest from 'supertest';
import { authenticatesForTesting } from '../helpers/authenticatesForTesting';

describe('POST /api/v1/wallets', () => {
  let token: string;

  beforeAll(async () => {
    token = await authenticatesForTesting((global as any).app);
  });

  it('deve criar uma carteira com sucesso', async () => {
    const response = await supertest((global as any).app.server)
      .post('/api/v1/wallets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Carteira Principal',
        type: 'personal',
        currency: 'BRL',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      name: 'Carteira Principal',
      type: 'personal',
    });
  });

  it('deve retornar 422 sem nome', async () => {
    const response = await supertest((global as any).app.server)
      .post('/api/v1/wallets')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'personal' });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });

  it('deve retornar 401 sem token', async () => {
    const response = await supertest((global as any).app.server)
      .post('/api/v1/wallets')
      .send({ name: 'Test', type: 'personal' });

    expect(response.status).toBe(401);
  });
});
```

---

## Estrutura de Pastas de Testes

```
tests/
├── auth/
│   ├── register.test.ts
│   ├── login.test.ts
│   ├── logout.test.ts
│   └── refresh_token.test.ts
├── wallet/
│   ├── create_wallet.test.ts
│   ├── list_wallets.test.ts
│   ├── detail_wallet.test.ts
│   ├── update_wallet.test.ts
│   └── delete_wallet.test.ts
├── transaction/
│   ├── create_transaction.test.ts
│   ├── list_transactions.test.ts
│   ├── transfer.test.ts
│   └── ...
└── helpers/
    └── authenticatesForTesting.ts
```

---

## Cobertura Mínima por Módulo

Cada módulo deve ter testes cobrindo:

- [ ] Criação com sucesso (201)
- [ ] Criação com dados inválidos (422)
- [ ] Criação sem autenticação (401)
- [ ] Listagem (200)
- [ ] Detalhe encontrado (200)
- [ ] Detalhe não encontrado (404)
- [ ] Atualização com sucesso (200)
- [ ] Deleção com sucesso (204 ou 200)
- [ ] Regras de negócio específicas do módulo

---

## Regras

- **Execução Automática**: O agente deve rodar os testes (`npm test`) após cada implementação para validar a integridade.
- Um arquivo de teste por caso de uso.
- Usar banco de testes isolado (`DATABASE_URL_TEST`).
- Limpar banco antes de cada suite (`beforeAll` com `migrate reset`).
- Sempre testar o caminho feliz E os casos de erro.
- Cobertura mínima: 80% nas camadas de Service e Controller.
- Não testar detalhes de implementação do Repository — testar comportamento via HTTP.
