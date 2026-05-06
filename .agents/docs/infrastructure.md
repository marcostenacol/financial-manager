# Infrastructure — Docker e Ambiente

## Serviços Docker

```yaml
# docker-compose.yml (produção)
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://financial:financial@db:5432/financial
      REDIS_URL: redis://cache:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
    depends_on: [db, cache]

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: financial
      POSTGRES_USER: financial
      POSTGRES_PASSWORD: financial
    volumes:
      - ./financial-manager-api/docker/postgres:/docker-entrypoint-initdb.d
      - postgres_data:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    volumes:
      - ./financial-manager-api/docker/redis:/usr/local/etc/redis
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./financial-manager-ui/docker/nginx/conf.d:/etc/nginx/conf.d
    depends_on: [app]
```

---

## Variáveis de Ambiente

```env
# .env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://financial:financial@localhost:5432/financial
DATABASE_URL_TEST=postgresql://financial:financial@localhost:5432/financial_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
STORAGE_PATH=./storage
```

---

## Makefile — Comandos Úteis

```makefile
# Desenvolvimento
up:         docker-compose -f docker-compose.local.yml up -d
down:       docker-compose -f docker-compose.local.yml down
logs:       docker-compose -f docker-compose.local.yml logs -f app

# Banco
migrate:    npx prisma migrate dev
generate:   npx prisma generate
studio:     npx prisma studio
seed:       npx prisma db seed

# App
dev:        npm run dev
build:      npm run build
test:       npx vitest run
test-watch: npx vitest
```

---

## Nginx

### app.local.conf (desenvolvimento)
```nginx
server {
    listen 80;
    server_name financial.local;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

> [!IMPORTANT]
> `experimentalDecorators` e `emitDecoratorMetadata` são **obrigatórios** para o tsyringe funcionar.

---

## Dependências Principais

```json
{
  "dependencies": {
    "fastify": "^4.x",
    "@fastify/swagger": "^8.x",
    "@fastify/swagger-ui": "^3.x",
    "@fastify/jwt": "^8.x",
    "@fastify/multipart": "^8.x",
    "@prisma/client": "^5.x",
    "redis": "^4.x",
    "tsyringe": "^4.x",
    "zod": "^3.x",
    "bcrypt": "^5.x",
    "node-cron": "^3.x",
    "reflect-metadata": "^0.2.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5.x",
    "vitest": "^1.x",
    "supertest": "^6.x",
    "vite-tsconfig-paths": "^4.x",
    "@types/node": "^20.x",
    "@types/bcrypt": "^5.x",
    "@types/supertest": "^6.x",
    "tsx": "^4.x"
  }
}
```

---

## Entry Point — server.ts

```typescript
// src/server.ts
import 'reflect-metadata'; // OBRIGATÓRIO — primeiro import para tsyringe
import './shared/container'; // Registra todos os bindings do DI
import cron from 'node-cron';
import { buildApp } from './app';
import { container } from 'tsyringe';
import { ProcessRecurrenceService } from './modules/recurrence/services/ProcessRecurrenceService';

async function main() {
  const app = await buildApp();
  const port = Number(process.env.PORT) || 3000;

  await app.listen({ port, host: '0.0.0.0' });

  // Job: processar recorrências todo dia à meia-noite
  cron.schedule('0 0 * * *', async () => {
    const service = container.resolve(ProcessRecurrenceService);
    await service.execute();
  });

  console.log(`🚀 Server running on port ${port}`);
}

main().catch(console.error);
```
