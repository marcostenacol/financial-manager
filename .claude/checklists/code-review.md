# Checklist — Code review

## Geral

- [ ] Nenhum segredo (`.env`, `JWT_SECRET`, credencial de banco) em diff, log ou mensagem de commit
- [ ] Nenhuma alteração em código existente fora do escopo pedido (Regra de Preservação de Código)
- [ ] Identificadores em inglês, mensagem ao usuário em português

## API

- [ ] Fluxo `Route → Controller → Service → Repository → Prisma` respeitado
- [ ] `AppError` para erro de negócio esperado; nenhum `throw new Error()` solto que devesse virar resposta HTTP controlada
- [ ] Entrada validada por Zod (`.parse`) — sinalizar (não necessariamente bloquear) se usar `as any` em código novo
- [ ] Dependência nova registrada em `src/shared/container/index.ts`
- [ ] Cache invalidado após escrita relevante
- [ ] Checagem de posse do recurso (`userId`) antes de operar sobre `:id` de rota
- [ ] `npm run build` sem erro

## UI

- [ ] Chamada HTTP via `api` de `src/services/api.ts`
- [ ] Componente em `PascalCase.tsx`, no diretório certo (`components/` vs `pages/`)
- [ ] `npm run lint` sem novo problema

## Pontos de débito técnico a sinalizar, não bloquear sozinho

- [ ] Novo uso do padrão `BaseRepository` vs `prisma` direto — nomear a escolha no PR
- [ ] Mudança perto de `AuthMiddleware`/sessão em Redis — confirmar se a tarefa pediu mudança de comportamento de segurança
- [ ] Nova chave de cache — confirmar que bate com o padrão já usado no módulo (evitar inventar formato novo de chave)

Ver `.claude/CLAUDE.md` > `Débito Técnico e Divergências Conhecidas` para a lista completa.
