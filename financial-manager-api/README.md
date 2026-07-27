# financial-manager-api

API REST de gestão financeira pessoal — Node.js/TypeScript + Fastify 5 + Prisma 7 + Redis. Ver `.claude/CLAUDE.md` (raiz do monorepo) para a documentação completa de arquitetura, convenções e débito técnico conhecido.

## Comandos principais

```bash
npm run dev            # tsx watch src/server.ts
npm run build           # tsc
npm test                # vitest run
npm run test:watch       # vitest (watch)
npm run generate         # prisma generate
```

## Banco de dados e migrations do Prisma

O Postgres usado por este projeto (`central-db`) é um banco **compartilhado**, provisionado fora deste
repositório pelo `docker-compose.yml`/setup do `infra-core`, mais SQL aplicado manualmente ao longo do tempo
(schemas/tabelas de outros projetos convivem no mesmo cluster). Ele **não** é um banco dedicado só para esta
API, criado do zero a partir das migrations do Prisma.

Isso tem uma consequência prática importante: **não rode `prisma migrate dev` contra este banco.**

- `prisma migrate dev` tenta comparar o "shadow database" com o histórico de migrations e, ao detectar que o
  schema `public` já tem tabelas/dados que não batem exatamente com o que o Prisma esperava (por ser um banco
  compartilhado com outros projetos/alterações manuais), ele entende que o banco está "not empty" e oferece
  resetar (`drop`) o schema para poder aplicar as migrations do zero — o que destruiria dados de outros
  projetos/tabelas no mesmo `central-db`. Esse é o "schema not empty / needs reset trap".
- O fluxo correto aqui é: **escrever a migration manualmente** (SQL em
  `prisma/migrations/{timestamp}_{nome}/migration.sql`, seguindo a convenção de nome já usada nas migrations
  existentes) e depois marcá-la como aplicada no histórico do Prisma sem executá-la de novo, com:

  ```bash
  npx prisma migrate resolve --applied "<timestamp>_<nome_da_migration>"
  ```

  Isso apenas registra a entrada na tabela `_prisma_migrations` (assumindo que o SQL equivalente já foi
  aplicado ao banco manualmente ou já corresponde ao estado real das tabelas) — não executa `migrate dev`
  nem `migrate reset`.
- Esse passo já foi necessário para reconciliar o histórico de duas migrations desta API
  (`20260506191031_create_savings_goals` e `20260727150000_create_notifications`), cujo estado no banco não
  batia com o que estava registrado em `_prisma_migrations`. Sem o `resolve --applied`, qualquer
  `migrate dev`/`migrate deploy` futuro tentaria reaplicar (ou pediria reset) sobre um schema que já tinha as
  tabelas.

Para confirmar que o histórico de migrations está consistente com o banco, rode (de fora do container, contra
a porta exposta do `central-db` em `localhost:5432`):

```bash
DATABASE_URL="postgresql://postgres:central_password@localhost:5432/financial_db?schema=public" npx prisma migrate status
```

Saída esperada quando está tudo consistente:

```
2 migrations found in prisma/migrations

Database schema is up to date!
```

Se aparecer alguma migration como "not yet applied" ou um aviso de drift/reset, **não rode `migrate dev`/`migrate reset` para "resolver"** — investigue o schema real (`\d` no `psql`, ou `prisma db pull` num schema à parte para comparar) e, se o SQL já existir de fato no banco, use `prisma migrate resolve --applied` como acima.
