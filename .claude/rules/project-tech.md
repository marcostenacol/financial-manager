# Configuração Técnica

## Sem containers de desenvolvimento local por padrão

Diferente do projeto de referência GIZ, não há `Makefile` nem um `docker-compose.local.yml` de desenvolvimento — os comandos `npm run dev` rodam direto no host (API via `tsx watch`, UI via Vite dev server). Os `docker-compose.yml` existentes (um por subpasta) são voltados a implantação (`homolog`/produção), com Docker Compose **profiles**:

### API (`financial-manager-api/docker-compose.yml`)

| Serviço | Imagem/build | Profiles | Porta |
|---------|---------------|----------|-------|
| `api` | build local (`docker/api/Dockerfile`) | `homolog`, `main` | `3000:3000` |
| `cache` (Redis) | `redis:7-alpine` | `homolog`, `main` | interna (healthcheck) |
| `db` (Postgres) | `postgres:16-alpine` | `homolog` apenas | `5434:5432` |

Note que o serviço `db` só sobe no profile `homolog` — no profile `main` (produção, presumível), a API espera um Postgres/Redis já centralizados fora deste compose (`DATABASE_URL`/`REDIS_URL` apontando para `central-db`/`cache` externos via `shared-network`, uma rede Docker `external: true`).

### UI (`financial-manager-ui/docker-compose.yml` + `Dockerfile`)

Dockerfile multi-stage: builder `node:20-alpine` roda `npx vite build` (build-time recebe `VITE_API_URL` via `ARG`/`ENV`, já que Vite injeta env vars só em tempo de build) gerando `dist/`; stage final `nginx:1.27-alpine` serve esse `dist/` como estático, com `nginx.conf` fazendo fallback de SPA (`try_files ... /index.html`) para o roteamento do `react-router-dom`. Porta interna do container é `80`, mapeada para `5173` no host (`docker-compose.yml`: `"5173:80"`) — o número `5173` é só a porta externa histórica, não tem relação com o Vite dev server, que não corre mais em produção.

## Variáveis de ambiente

### API (`.env.example`)

```
DATABASE_URL   # postgresql://user:password@host:5432/dbname?schema=public
REDIS_URL      # redis://host:6379
JWT_SECRET
JWT_EXPIRES_IN        # ex.: 1d
JWT_REFRESH_EXPIRES_IN # ex.: 7d
PORT           # 3000
NODE_ENV
```

O `.env` real (não versionado) tem chaves adicionais (`DB_NAME`, `DB_USER`, `DB_PASSWORD`) usadas para montar `DATABASE_URL` no `docker-compose.yml` — não têm entrada correspondente no `.env.example`, então ao adicionar variável nova, atualize os dois arquivos.

### UI

```
VITE_API_URL   # URL base da API, consumida em src/services/api.ts — default 'http://localhost:3333/api/v1' se ausente
```

> **Resolvido**: o `.env` real da UI apontava pra um IP direto sem o prefixo `/api/v1` (`http://150.230.75.122:3000`), divergindo do fallback hardcoded em `src/services/api.ts` (`http://localhost:3333/api/v1`, porta e prefixo diferentes). Corrigido para `VITE_API_URL=https://api.financeiro.mvndev.online/api/v1` (domínio real, com o prefixo correto — `/api/v1` é registrado em `app.ts`). O fallback hardcoded em `api.ts` continua desatualizado (porta `3333` não existe em lugar nenhum do projeto) mas só é usado se a env var estiver ausente, o que não é mais o caso — não corrigido por não ser bloqueante.
>
> Como `VITE_API_URL` é uma env var do Vite, ela só é lida em **tempo de build**, não em runtime do container — mudar o `.env` exige rebuildar a imagem (`docker compose build ui`) para ter efeito, não basta reiniciar o container.

## Banco de dados — Prisma

- `prisma/schema.prisma`: um único schema, **sem** `@@schema(...)` multi-schema do Postgres (diferente do projeto de referência GIZ) — tudo no schema `public`.
- Nomes de model em `PascalCase` (`User`, `Wallet`, `Transaction`...), campos em `camelCase` mapeados para coluna `snake_case` via `@@map`/`@map` (ex.: `roleId String @map("role_id")`, model `User` → `@@map("users")`).
- IDs são `String @id @default(uuid())` — todas as PKs são UUID, não serial incremental.
- Migrations em `prisma/migrations/{timestamp}_{nome}/migration.sql`, geradas por `npx prisma migrate dev --name {nome}` (`npm run migrate:dev`).
- Seed em `prisma/seed.ts`, registrado em `package.json > prisma.seed` (`tsx prisma/seed.ts`).

## Redis

Cliente `redis` (não `ioredis`), acessado via `getRedisClient()` em `src/shared/cache/RedisClient.ts`, consumido pela `CacheTrait` (`get`/`set`/`del`/`delPattern`). TTL padrão documentado em `.agents/docs/backend/STANDARDS.md`: 300s para listagens, 60s para relatórios — mas confirme no Service real antes de assumir, já que nem todo `cache.set(...)` no código passa o TTL explicitamente (o default do método `set()` da `CacheTrait` é 300s quando omitido).

## Documentação de API

`@fastify/swagger` + `@fastify/swagger-ui`, servido em `/docs`, gerado por introspecção automática das rotas Fastify registradas (**não** por anotação manual como no projeto de referência GIZ com `vyuldashev/laravel-openapi`) — não há pasta equivalente a `app/OpenApi/`. Adicionar `schema` ao `fastify.get/post/put/delete(...)` na definição da rota é a forma de enriquecer o Swagger gerado; hoje a maioria das rotas registra sem `schema` (ver `transactionRoutes` em `rules/layers.md`), então o Swagger gerado hoje é raso.
