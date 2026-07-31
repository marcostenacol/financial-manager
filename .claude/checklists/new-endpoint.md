# Checklist — Novo endpoint (API)

- [ ] Módulo identificado/criado em `src/modules/{modulo}/`
- [ ] Se precisa de dado novo: `prisma/schema.prisma` atualizado + `npm run migrate:dev`
- [ ] DTO Zod criado em `dtos/{Ação}{Entidade}DTO.ts` (schema + `{...}DTOType`), mensagens de erro em português
- [ ] Enum criado em `enums/` se o DTO usa domínio fechado (status, tipo) sem Enum existente
- [ ] Interface de Repository em `repositories/contracts/{Modulo}RepositoryInterface.ts`
- [ ] Repository implementado — decida `BaseRepository` vs `prisma` direto e mantenha consistente com o resto do módulo já existente, se houver
- [ ] Service com método único `execute()`, injeta Repository(s) pela interface via `@inject()`, checa posse do recurso quando aplicável, invalida cache relevante após escrita
- [ ] Controller estende `BaseController`, valida body/query com `.parse(schema)`, chama `this.success(reply, ...)`/deixa `AppError` subir para o `ErrorHandler`
- [ ] Rota registrada em `routes.ts` do módulo, com `authMiddleware` aplicado (a menos que seja rota pública, como em `auth`)
- [ ] Se módulo novo: prefixo registrado em `src/app.ts` (`app.register({modulo}Routes, { prefix: '/api/v1/{modulo}' })`)
- [ ] Repository/Service/Controller registrados em `src/shared/container/index.ts`
- [ ] `npm run build` sem erro de tipo
- [ ] Teste unitário do Service novo (mock de Repository/Cache) — se a ação for sensível (dinheiro, saldo, autenticação), não pule
- [ ] `.agents/PROGRESS.md` atualizado, se o item corresponder a algo lá listado
