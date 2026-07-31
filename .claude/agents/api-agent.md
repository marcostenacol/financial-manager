# Agente — Backend (financial-manager-api)

Contexto: Fastify 5 + TypeScript strict + Prisma 7 + PostgreSQL + Redis + tsyringe. Ver `.claude/rules/architecture.md` e `.claude/rules/layers.md` para o fluxo completo.

## Ao implementar algo na API

1. Ler `.agents/PROGRESS.md` antes de começar — é a fonte de verdade de progresso mantida pelo harness existente.
2. Localizar o módulo em `src/modules/{modulo}/` — se o módulo não existir, crie a estrutura completa (`controllers/`, `dtos/`, `repositories/contracts/`, `services/`, `routes.ts`, `enums/` se houver domínio fechado).
3. Fluxo de escrita: `schema.prisma` (se precisar de tabela/coluna nova) → migration (`npm run migrate:dev`) → DTO Zod → Repository (+ interface) → Service → Controller → `routes.ts` → registro em `src/shared/container/index.ts` → registro do prefixo em `src/app.ts` (só se o módulo for novo).
4. Toda dependência nova precisa ser registrada em `src/shared/container/index.ts` (`container.registerSingleton<Interface>('Token', Implementacao)`) — sem isso, o `@inject('Token')` falha em runtime, não em compile-time.
5. Validar tipo com `npm run build` (`tsc`) antes de considerar a tarefa pronta — não há lint na API hoje.
6. Antes de rodar `npm test`, ver a nota em `rules/testing.md` sobre a política incerta de execução automática de teste — confirme com o usuário se não estiver claro.

## Ao tocar código próximo ao débito técnico conhecido

Ver `CLAUDE.md` > `Débito Técnico e Divergências Conhecidas` no root do `.claude/`. Resumo dos pontos que mais aparecem ao trabalhar na API:
- `BaseRepository` só é usado por 3 de ~9 Repositories — não uniformize sem pedido.
- `AuthMiddleware` não bloqueia de fato quando a sessão não está em Redis — sinalize se a tarefa tocar autenticação/logout.
- DTOs em `snake_case`, Prisma em camelCase — conversão manual, sem mapper; ao adicionar campo a um DTO existente, confira se a conversão para o Service/Repository foi atualizada também.
- Cast `request.body as any` convive com `.parse(schema)` — use `.parse` em código novo.

## Não fazer sem pedido explícito

- Não migre Repository entre os dois padrões de acesso ao Prisma.
- Não adicione Supertest a specs existentes (`tests/modules/**`) — todos são unitários com mock hoje.
- Não implemente paginação estruturada em listagem existente — não há esse padrão hoje (ver `rules/response-patterns.md`).
