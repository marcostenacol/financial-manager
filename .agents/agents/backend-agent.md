# Backend Agent — Sistema Financeiro (Fastify + Prisma)

## Papel

Este é o arquivo principal de orientação para qualquer tarefa de backend neste projeto. Ao receber uma solicitação de backend, leia este arquivo primeiro.

Objetivo:

- manter consistência arquitetural;
- reduzir gasto de token com contexto repetido;
- indicar onde pesquisar antes de editar;
- garantir que a implementação siga o padrão modular.

## Stack

- **Runtime**: Node.js 20 (LTS)
- **Framework**: Fastify 4
- **ORM**: Prisma 5
- **Banco**: PostgreSQL 16
- **Cache**: Redis 7 via `RedisClient.ts`
- **Auth**: JWT (access + refresh token)
- **DI**: tsyringe
- **Testes**: Vitest + Supertest
- **Linguagem**: TypeScript 5 (strict mode)

## Leitura Obrigatória Inicial

Antes de propor ou editar qualquer código de backend, consulte nesta ordem:

1. `.agents/docs/backend/STANDARDS.md`
2. `.agents/docs/backend/architecture-summary.md`
3. `.agents/docs/backend/controllers.md`
4. `.agents/docs/backend/index.md`

Se a tarefa envolver uma área específica, siga também a trilha de pesquisa descrita abaixo.

## Fluxo Arquitetural Obrigatório

Toda implementação de backend deve respeitar este fluxo:

```
HTTP Request → Fastify Route → Controller → Service → Repository → Prisma/SQL
```

Regras permanentes:

- `Route` registra o endpoint e aponta para o Controller handler.
- `Controller` valida input (via Zod DTO), delega ao Service e formata resposta com `Response.ts`.
- `Service` centraliza regra de negócio e orquestração. Método único: `execute(dto)`.
- `Repository` centraliza persistência. Usa Prisma para CRUD simples e SQL puro/CTEs para queries complexas.
- `Prisma Schema` é a fonte da verdade para estrutura de dados.

## Estrutura de Pastas por Módulo

```
src/modules/{modulo}/
├── controllers/
│   └── {Modulo}Controller.ts
├── dtos/
│   ├── Create{Modulo}DTO.ts
│   └── Update{Modulo}DTO.ts
├── enums/
│   └── {Modulo}TypeEnum.ts
├── repositories/
│   ├── contracts/
│   │   └── {Modulo}RepositoryInterface.ts
│   └── {Modulo}Repository.ts
├── services/
│   ├── Create{Modulo}Service.ts
│   ├── List{Modulo}sService.ts
│   ├── Detail{Modulo}Service.ts
│   ├── Update{Modulo}Service.ts
│   └── Delete{Modulo}Service.ts
└── routes.ts
```

## Como Decidir Onde Mexer

Use estas regras para localizar a camada correta:

- validação de entrada: `dtos/{nome}DTO.ts` (Zod schema)
- formato de saída JSON: `Response.ts` em `src/base/traits/`
- fluxo HTTP e resposta: `controllers/{nome}Controller.ts`
- regra de negócio e orquestração: `services/{nome}Service.ts`
- consulta, filtro, ordenação e persistência: `repositories/{nome}Repository.ts`
- estrutura de dados: `prisma/schema.prisma`
- enumerações de domínio: `enums/{nome}Enum.ts`
- jobs agendados: `services/{nome}Service.ts` + `node-cron` no `server.ts`
- middleware de auth: `src/shared/middlewares/AuthMiddleware.ts`
- middleware de permissão: `src/shared/middlewares/PermissionMiddleware.ts`
- erros: `src/shared/errors/AppError.ts`
- DI container: `src/shared/container/index.ts`

## Onde Pesquisar por Tipo de Tarefa

### 1. Nova rota ou endpoint

Leia nesta ordem:

1. `src/modules/{modulo}/routes.ts`
2. `src/modules/{modulo}/controllers/{nome}Controller.ts`
3. `src/modules/{modulo}/dtos/`
4. `src/modules/{modulo}/services/`
5. `src/modules/{modulo}/repositories/`
6. `prisma/schema.prisma`

Valide também:

- prefixo da rota: `/api/v1/{modulo}`;
- autenticação exigida (`preHandler: [authMiddleware]`);
- formato padrão de resposta via `Response.ts`;
- status code correto.

### 2. Regra de negócio

Leia nesta ordem:

1. service relacionado
2. repository envolvido
3. DTOs que entram e saem do fluxo
4. `prisma/schema.prisma` para entender o modelo de dados

Nunca implemente regra de negócio em Controller, Repository ou diretamente na Route.

### 3. Banco de dados / Schema

Se a tarefa envolver tabela, coluna, relacionamento ou migração, leia nesta ordem:

1. `.agents/docs/backend/database.md`
2. `prisma/schema.prisma`
3. `prisma/migrations/` (histórico)
4. Repository relacionado

Sempre confirme no schema real:

- nomes de campos (camelCase no Prisma, snake_case no banco via `@map`);
- nullable (`?`);
- defaults (`@default`);
- foreign keys (`@relation`);
- índices (`@@index`, `@@unique`).

### 4. Listagem de dados

Leia nesta ordem:

1. rota de listagem
2. controller `list`
3. DTO de filtros (query params)
4. repository da listagem
5. verificar uso de cache (`CacheTrait.ts`)

Sempre verificar:

- paginação obrigatória (`page`, `limit`);
- filtros via query params tipados;
- ordenação;
- cache com `cacheKey` contextualizado por `user_id`.

### 5. Cache

Toda listagem e detalhe devem usar `CacheTrait.ts`:

```typescript
const cache_key = `wallets:user:${user_id}`;
const cached = await this.cache.get(cache_key);
if (cached) return cached;
// ... busca no banco
await this.cache.set(cache_key, result, 300); // TTL 5 min
```

Invalidar ao criar/atualizar/deletar:
```typescript
await this.cache.del(`wallets:user:${user_id}`);
```

### 6. Auth & Token

- `AuthMiddleware.ts` valida o JWT e verifica no Redis antes do banco.
- `LogoutService` invalida o `refresh_token` via `expires_at = now()`.
- `RefreshTokenService` gera novo par de tokens.

### 7. Bugfix

Leia e siga nesta ordem:

1. route (ponto de entrada)
2. controller
3. service
4. repository
5. `prisma/schema.prisma` se suspeita de problema estrutural

Corrija o bug na camada correta.

### 8. Relatórios (Módulo Report)

Todos os services do módulo `report/` **obrigatoriamente** usam CTEs PostgreSQL via `prisma.$queryRaw`. Leia:

1. `.agents/docs/backend/repositories.md` (seção CTEs)
2. `.agents/skills/sql-optimizer/SKILL.md`
3. service de relatório relacionado

## Regras Curtas Invioláveis

- nunca acessar `Prisma` diretamente no `Controller` ou `Service`;
- nunca colocar regra de negócio no `Repository`;
- nunca formatar resposta no `Service` — use `Response.ts` no Controller;
- nunca retornar erro técnico interno ao cliente — use `AppError`;
- sempre usar `@injectable()` e `@inject()` para DI via tsyringe;
- sempre usar Zod para validar DTOs de entrada;
- sempre usar cache em listagens — nunca bater direto no banco;
- sempre invalidar cache relevante ao alterar dados;
- sempre usar CTEs em queries de relatório e listagens complexas;
- nunca usar `any` implícito — TypeScript strict;
- sempre procurar o fluxo existente antes de criar arquivo novo.

## Checklist Antes de Finalizar

- [ ] a camada alterada está correta?
- [ ] a validação está no DTO (Zod)?
- [ ] a regra de negócio está no Service?
- [ ] a persistência está no Repository?
- [ ] a resposta usa `Response.ts`?
- [ ] o status code está correto?
- [ ] a rota segue o prefixo `/api/v1/{modulo}`?
- [ ] se houver listagem, tem paginação e cache?
- [ ] se houver impacto no banco, `schema.prisma` foi atualizado?
- [ ] existe teste ou critério claro de validação?
- [ ] DI foi configurado no container (`src/shared/container/index.ts`)?

## Referências

- `.agents/docs/backend/STANDARDS.md`
- `.agents/docs/backend/architecture-summary.md`
- `.agents/docs/backend/controllers.md`
- `.agents/docs/backend/services.md`
- `.agents/docs/backend/repositories.md`
- `.agents/docs/backend/dtos.md`
- `.agents/docs/backend/cache_helpers.md`
- `.agents/docs/backend/database.md`
- `.agents/docs/backend/testing-tdd.md`
