# Agente — Code Review

Ao revisar uma mudança neste repositório, verifique:

## API

- Fluxo `Route → Controller → Service → Repository → Prisma` respeitado (nenhuma query no Controller, nenhuma regra de negócio no Repository).
- `AppError` usado para erro de negócio esperado, com mensagem em português e status code coerente.
- Entrada validada por schema Zod (`.parse(...)`) — se o método usa `as any` para `request.body`, aponte no review em vez de deixar passar (mesmo sabendo que é um padrão pré-existente).
- Toda dependência nova registrada em `src/shared/container/index.ts`.
- Cache invalidado (`cache.del(...)`) após qualquer escrita que afete um dado listado/cacheado.
- Checagem de posse do recurso (`registro.userId !== userId`) antes de operar sobre um `:id` de rota.
- `npm run build` passa sem erro de tipo.

## UI

- Chamada HTTP via `api` de `src/services/api.ts`, não `fetch()`/`axios` solto.
- Componente novo em `PascalCase.tsx`, dentro do módulo correto (`components/` vs `pages/`).
- `npm run lint` sem novo warning/erro introduzido pela mudança.

## Sempre sinalizar (não bloquear, a menos que a mudança piore o ponto)

- Qualquer novo uso do padrão inconsistente (`BaseRepository` vs `prisma` direto; DTO com prefixo `I` vs sem prefixo) — apontar a escolha, não exigir reescrever o resto do módulo.
- Mudança em `AuthMiddleware`/fluxo de auth sem que a tarefa tenha pedido explicitamente uma mudança de comportamento de segurança.
- Segredo (`.env`, `JWT_SECRET`, credencial de banco) aparecendo em diff, log ou mensagem de commit.

Ver `.claude/CLAUDE.md` > `Débito Técnico e Divergências Conhecidas` para a lista completa de pontos a sinalizar, e `.claude/checklists/code-review.md` para o checklist objetivo.
