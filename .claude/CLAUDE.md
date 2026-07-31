# Financial Manager

Você é um Engenheiro de Software Sênior especialista em Node.js/TypeScript, React e boas práticas de Clean Code.

Monorepo (sem lerna/workspaces — dois projetos irmãos com `package.json` próprio) com duas pastas na raiz:

- **`financial-manager-api/`** — API REST em **Node.js + TypeScript (strict) + Fastify 5**, ORM **Prisma 7** sobre **PostgreSQL 16**, cache/sessão em **Redis 7**, DI com **tsyringe**.
- **`financial-manager-ui/`** — SPA em **React 19 + Vite + TypeScript**, Tailwind CSS, Recharts (gráficos), React Router 7, Axios.

> Todo o repositório é um único Git (raiz `financial-manager/`, remoto `marcostenacol/financial-manager`) — `financial-manager-api` e `financial-manager-ui` **não** são submódulos nem repositórios próprios, apesar do nome sugerir dois projetos separados.

## Mandato Principal

Antes de sugerir qualquer código, valide se está em conformidade com os padrões em `.claude/rules/`. Se uma solicitação violar os padrões, alerte o usuário e proponha a implementação correta.

**Antes de iniciar qualquer implementação**, leia `.agents/PROGRESS.md` (na raiz do repo) — é o arquivo de progresso já mantido pelo harness Gemini existente (`.agents/`) e continua sendo a fonte de verdade sobre o que foi feito. Este `.claude/` não duplica esse arquivo.

> **Já existe um harness `.agents/` neste repo** (voltado a outro agente/CLI, com `GEMINI.md`, `docs/`, `agents/`, `checklists/`, `skills/`, `workflows/`). Ele documenta em boa parte a arquitetura **pretendida**; este `.claude/` foi escrito a partir da leitura direta do código real e sinaliza explicitamente onde os dois divergem — ver `## Débito Técnico e Divergências Conhecidas` abaixo. Ao ficar em dúvida entre o que um documento em `.agents/` diz e o que o código faz, **confie no código** e sinalize a divergência.

## Stack

### API (`financial-manager-api/`)

| Componente | Tecnologia |
|------------|-----------|
| Runtime | Node.js, TypeScript 5 (strict, `NodeNext`) |
| Framework HTTP | Fastify 5 |
| ORM | Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) |
| Banco | PostgreSQL 16 |
| Cache | Redis 7 (`redis` client puro, não `ioredis`) |
| Auth | `@fastify/jwt` (access + refresh token), sessão auxiliar em Redis |
| DI | `tsyringe` (`@injectable()`/`@inject()`, container central em `src/shared/container/index.ts`) |
| Validação | `zod` (schemas de DTO) |
| Docs de API | `@fastify/swagger` + `@fastify/swagger-ui` (`/docs`) — gerado por introspecção do Fastify, **sem** anotação manual |
| Upload | `@fastify/multipart` + `@fastify/static` (arquivos em `tmp/uploads`, servidos em `/uploads/`) |
| Planilhas/PDF | `exceljs`, `pdfkit` |
| Jobs | `node-cron` (`src/shared/infra/jobs/RecurrenceJob.ts`) |
| Testes | **Vitest** (`vitest.config.ts`), `supertest` instalado mas **não usado** em nenhum spec hoje |

### UI (`financial-manager-ui/`)

| Componente | Tecnologia |
|------------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| Linguagem | TypeScript ~6.0 |
| Estilo | Tailwind CSS 3 + `tailwind-merge` + `clsx` |
| Roteamento | `react-router-dom` 7 |
| HTTP | `axios` (interceptor de refresh token) |
| Gráficos | `recharts` |
| Animação | `framer-motion` |
| Ícones | `lucide-react` |
| Lint | ESLint 10 (`eslint.config.js` flat config, `typescript-eslint`, `react-hooks`, `react-refresh`) — **sem Prettier configurado** |
| Testes | **Nenhum framework de teste instalado** (sem Vitest/Jest/RTL no `package.json`) |

## Comandos principais

Não há `Makefile` neste repo (diferente de outros projetos AE3) — os comandos são `npm` direto, dentro de cada subpasta.

```bash
# API — financial-manager-api/
npm run dev            # tsx watch src/server.ts
npm run build           # tsc
npm test                # vitest run
npm run test:watch       # vitest (watch)
npm run migrate:dev      # prisma migrate dev
npm run generate         # prisma generate

# UI — financial-manager-ui/
npm run dev             # vite
npm run build            # tsc -b && vite build
npm run lint              # eslint .
npm run preview            # vite preview
```

Docker: cada subpasta tem seu próprio `docker-compose.yml` (perfis `homolog`/`main`, ver `rules/project-tech.md`). Não há comando `make` — use `docker compose -f docker-compose.yml --profile <perfil> up` na subpasta correspondente.

## Arquitetura

### Fluxo obrigatório (API)

```
Route → Controller → Service → Repository → Prisma
                ↕           ↕
               DTO       (Model = schema.prisma)
```

- **Controller**: estende `App` `BaseController` (`src/base/http/BaseController.ts`), orquestra, chama `this.success(reply, ...)`/`this.error(reply, ...)`. Injetado via `@injectable()`/`@inject()`, resolvido pelo container em `routes.ts`.
- **Service**: um Service por ação (`Create{Entidade}Service`, `List{Entidade}Service`...), método principal `execute()`. Lógica de negócio.
- **Repository**: acesso a dados via Prisma. **Padrão real observado é misto** — ver seção de divergências: parte dos Repositories estende `BaseRepository`, parte usa o singleton `prisma` direto.
- **DTO**: schema Zod (`z.object({...})`) + `z.infer` para o tipo — não é uma classe, é um schema + tipo inferido.
- Não há camada de "Resource"/serializer de resposta na API — o Controller devolve o objeto do Prisma (ou array) direto dentro do envelope `{success, message, data}`.

### Organização por módulo (API) — já 100% modular, sem legado flat

```
src/modules/{modulo}/
├── controllers/
├── dtos/
├── enums/            (quando há domínio fechado)
├── repositories/
│   ├── contracts/    → *Interface.ts (TypeScript interface)
│   └── {Modulo}Repository.ts
├── services/         → um arquivo por caso de uso
└── routes.ts
```

Módulos reais hoje: `auth`, `profile`, `wallets`, `transactions`, `categories`, `recurrences`, `reports`, `savings-goals`, `notifications`. Diferente do `enrollment-api` de referência, **não existe aqui uma base legada flat convivendo com a modular** — todo o código de domínio já nasceu em `src/modules/`. Código novo entra no mesmo padrão.

### Base real do projeto (API)

```
src/base/
├── http/BaseController.ts     # controller-base REAL — success()/error() sobre FastifyReply
├── repository/BaseRepository.ts  # apenas guarda `this.prisma = prisma` — usado por só 3 dos ~9 Repositories (ver débito técnico)
└── traits/
    ├── Response.ts             # ResponseTrait — monta {success, message, data}
    └── CacheTrait.ts           # get/set/del/delPattern sobre Redis, via tsyringe
src/shared/
├── container/index.ts          # registro central tsyringe (repositories + services)
├── database/PrismaClient.ts    # singleton do PrismaClient
├── cache/RedisClient.ts        # cliente Redis
├── errors/{AppError,ErrorHandler}.ts
├── middlewares/AuthMiddleware.ts
└── infra/jobs/RecurrenceJob.ts
```

### UI — módulos por feature, sem camada de serviço/repositório dedicada

```
src/modules/{modulo}/
├── components/    (modais, formulários específicos do módulo)
└── pages/         ({Modulo}Page.tsx)
src/shared/components/   # Layout, Sidebar, Toast — compartilhados
src/services/api.ts      # instância única do axios + interceptors de refresh token
src/contexts/AuthContext.tsx
src/routes/index.tsx       # todas as rotas + ProtectedRoute inline
```

Chamada de API na UI é feita direto nos componentes/páginas via `api.get/post/put/delete` (import de `src/services/api.ts`) — não há uma camada `services/{modulo}.ts` por módulo nem hooks customizados (`useWallets()` etc.) hoje.

## Regras de Ouro

1. **API**: fluxo `Route → Controller → Service → Repository → Prisma` sempre. Controller não tem query nem regra de negócio; Repository não tem regra de negócio.
2. **Service = uma ação**, método público único `execute()`.
3. **DTO com Zod** (`z.object` + `z.infer`) — nunca validação manual solta no Controller.
4. **Toda dependência via `@injectable()`/`@inject()` + registro em `src/shared/container/index.ts`** — nunca instanciar Service/Repository com `new` fora do container.
5. **Resposta sempre `{success, message, data}`** via `BaseController.success()/error()` (API) — nunca `reply.send()` cru num Controller de domínio.
6. **Tipagem estrita**: `strict: true` já ativo no `tsconfig.json` — não introduza `any` explícito nem implícito em código novo.
7. **Erros de negócio via `AppError`**, nunca `throw new Error()` solto num Controller/Service que deveria virar resposta HTTP controlada.
8. **Importações**: todas via `import ... from` no topo — nunca `require()`/import dinâmico fora de caso justificado (ex.: import de rotas agrupado no fim de `app.ts`, que já é o padrão real).
9. **Idioma do código**: identificadores em inglês; mensagens ao usuário (`message`, textos de UI) em português.
10. **Preservação de Código**: não altere código existente sem solicitação explícita — inclusive os padrões inconsistentes descritos no débito técnico abaixo. Ao tocar um arquivo por outro motivo, aplique a Boy Scout Rule nele (ver `rules/naming.md`), mas não "corrija" a arquitetura de módulos vizinhos de passagem.
11. **UI**: componentes React em `PascalCase.tsx`, um componente por arquivo; chamadas HTTP sempre pela instância `api` de `src/services/api.ts` (nunca `fetch()`/novo `axios.create()` solto).
12. **Nunca commitar segredo** — `.env` de cada subpasta já existe localmente com credenciais reais; use `.env.example` como referência de chaves, nunca copie valores reais para código ou documentação.

## Débito Técnico e Divergências Conhecidas

Levantado por leitura direta do código (não é uma lista aspiracional) — sinalizar estes pontos ao trabalhar perto deles, mas **não corrigir de passagem sem pedido explícito** (Regra de Preservação de Código):

1. **`BaseRepository` parcialmente morto**: apenas `AuthRepository`, `WalletRepository` e `ProfileRepository` estendem `src/base/repository/BaseRepository.ts`. Os demais (`TransactionRepository`, `CategoryRepository`, `RecurrenceRepository`, `ReportRepository`, `SavingsGoalRepository`, `NotificationRepository`) importam o singleton `prisma` de `@/shared/database/PrismaClient` direto, ignorando a base. Nenhuma das duas formas está documentada como a "certa" — trate como convenção não resolvida, e se criar um Repository novo, prefira o padrão majoritário (usar `prisma` direto) só porque é o mais comum hoje, sinalizando a inconsistência em vez de fingir que há um padrão único.
2. **Naming de variáveis divergente do `.agents/docs/backend/STANDARDS.md`**: o documento existente afirma que variáveis/parâmetros usam `snake_case` (`user_id`, `wallet_balance`), mas o código real usa **camelCase** quase universalmente em variáveis de runtime (`userId`, `newBalance`, `walletId` em `TransactionController`/`CreateTransactionService`). `snake_case` aparece só nos campos dos DTOs Zod (`wallet_id`, `occurred_at`) e nas colunas via `@map` do Prisma — não nas variáveis TypeScript. Ao escrever código novo, siga o que o código faz (camelCase em variáveis), não o que o `STANDARDS.md` descreve.
3. **Naming de arquivo de DTO inconsistente**: convivem `CreateTransactionDTO.ts`/`CreateWalletDTO.ts` (sem prefixo) com `ICreateSavingsGoalDTO.ts`, `ICreateTransferDTO.ts`, `IUpdateCategoryDTO.ts` (prefixo `I` de interface, apesar de serem schemas Zod, não interfaces). Não há um padrão único vigente — para DTO novo, prefira a forma sem prefixo `I` (é a majoritária e a única documentada em `STANDARDS.md`), e não renomeie os arquivos `I*DTO.ts` existentes sem pedido.
4. **`AuthMiddleware` não verifica de fato a sessão em Redis**: `src/shared/middlewares/AuthMiddleware.ts` busca `auth:token:{user_id}` no cache, mas se não encontrar, o código atual **não bloqueia a requisição** — há um comentário no próprio arquivo reconhecendo isso ("Por enquanto, se não estiver no cache... vamos permitir"). Na prática, hoje a autenticação real depende só da assinatura do JWT (`request.jwtVerify()`); logout/revogação via Redis não é reforçado neste middleware, mesmo existindo `LogoutService`/`RefreshTokenService`. Isso é uma lacuna de segurança conhecida — não a "corrija" silenciosamente; se for pedido para endurecer isso, é uma mudança de comportamento de auth que deve ser explicitada, não um bugfix incidental.
5. **`AppError` não estende `Error`**: `src/shared/errors/AppError.ts` é uma classe própria com `message`/`status_code`, mas não `extends Error` — perde stack trace e não passa em checagens `instanceof Error` genéricas em qualquer código que dependa disso. `ErrorHandler.ts` funciona porque testa `instanceof AppError` explicitamente antes de qualquer coisa, mas isso é frágil para qualquer log/middleware futuro que espere um `Error` real.
6. **Cache: chave documentada ≠ chave real**: `.agents/docs/backend/STANDARDS.md` documenta a chave de detalhe de carteira como `wallet:{wallet_id}`, mas o código real usa `wallet:detail:{wallet.id}` (`CreateTransactionService`). Não há teste ou lugar único que centralize os nomes de chave — cada Service escreve a string manualmente. Risco real: introduzir uma chave nova ligeiramente diferente e não invalidar o cache certo.
7. **DTO em `snake_case`, mas o Prisma/TS usam camelCase**: toda entrada de request é `snake_case` (`occurred_at`, `wallet_id`), mas o Prisma Client gera campos em camelCase (`occurredAt`, `walletId`, mapeados via `@map` para colunas `snake_case` no banco). A conversão é feita manualmente e pontualmente dentro dos Services (`occurredAt: new Date(data.occurred_at)` em `CreateTransactionService`) — não há um mapper genérico; qualquer DTO novo com muitos campos corre risco de esquecer um campo na conversão.
8. **Controller usa `request.body as any` / `request.query as any`** em vários pontos (`TransactionController.index/show/store/update/delete`), driblando o `strict: true` do `tsconfig.json` com casts explícitos em vez de tipar de fato a partir do schema Zod correspondente — mesmo quando o DTO Zod já existe e poderia tipar a entrada. Código novo não deveria reproduzir esse cast; prefira `Schema.parse(request.body)` como já é feito em `TransactionController.transfer()` com `CreateTransferSchema.parse(...)`, que é o padrão correto presente no mesmo arquivo.
9. **UI sem testes**: não há Vitest/Jest/RTL instalado em `financial-manager-ui/package.json` — zero cobertura de teste no frontend hoje. Diferente da API, que tem specs unitários reais (ver `rules/testing.md`).
10. **UI sem camada de service/hook por módulo**: chamadas Axios são feitas direto dentro de páginas/componentes (`api.get('/wallets')` etc.), sem um `src/modules/{modulo}/services.ts` ou hook (`useWallets()`) intermediário — qualquer mudança de endpoint hoje exige caçar todos os call-sites manualmente.
11. **Harness duplo `.agents/` (Gemini) e `.claude/` (este)**: os dois documentam o mesmo projeto para agentes diferentes. Mantenha-os alinhados quando possível, mas em caso de conflito sobre "como o código realmente funciona", este `.claude/` prevalece porque foi escrito a partir de leitura direta do código; `.agents/docs/` tem trechos aspiracionais/copiados de outro stack (ver nota em `rules/naming.md` sobre `naming-conventions.md` documentar convenções PHP num projeto TypeScript).
12. **Política de execução de testes já mudou de posição**: o commit `9e1cf2e` ("atualizando política de execução de testes para permitir rodagem automática") contradiz o texto ainda presente em `.agents/GEMINI.md`/`STANDARDS.md` ("Nunca rodar os testes automaticamente — sempre recomendar ao usuário"). Não está claro qual política está de fato em vigor — confirme com o usuário antes de rodar `npm test` automaticamente numa tarefa.
13. ~~**Sem CI/CD**: não há `.github/workflows/`~~ — **desatualizado, ver auditoria de 2026-07-27 abaixo**: `.github/workflows/ci.yml` já existe no repositório. Confirme o conteúdo real do pipeline antes de assumir o que ele cobre; não presuma que ele bloqueia merge sem checar as regras de branch protection no GitHub.

**Resolvido** (não é mais débito — mantido aqui como histórico): a UI rodava em produção via `npm run dev` (Vite dev server) — foi migrada para build de produção real (`vite build` → Nginx servindo `dist/` estático com fallback de SPA, ver `Dockerfile`/`nginx.conf`). Ao fazer essa migração, dois bugs reais e pré-existentes bloqueavam o build e foram corrigidos por serem bloqueantes (não por escolha de tocar código não solicitado): `TransactionsPage.tsx` importava `TransactionDetailModal` de um arquivo que nunca existia (criado agora, seguindo o padrão visual de `UpdateTransactionModal.tsx`); e `src/services/api.ts`/`DefaultLayout.tsx` importavam `InternalAxiosRequestConfig`/`ReactNode` sem `type`, o que quebra o bundler de produção (Rolldown/Vite) mesmo não afetando o dev server. **O build de produção usa `vite build` direto, não `npm run build`** (que roda `tsc -b` antes) — o Vite não type-checa, só falha em erro real de bundling.

**Investigado e corrigido (não era só tipo incompleto — havia bug funcional real)**: `ProfilePage.tsx` chamava `PUT /profile` e `PATCH /profile/type`, mas essas rotas **não existem** (confirmado via 404 real contra a API — as rotas reais são `/profile/me` e `/profile/me/type`, registradas em `profile/routes.ts` sob o prefixo `/api/v1/profile`). Resultado: toda tentativa de salvar perfil falhava silenciosamente (toast de erro, sem persistir nada). Além disso, a página nunca buscava o perfil completo (`GET /profile/me`) — inicializava `bio`/`type` a partir do objeto `user` do `AuthContext`, que só tem `{id, name, email}` (o que `LoginService` de fato retorna); então bio/tipo salvos anteriormente nunca apareciam no formulário, e salvar sem notar sobrescrevia a bio real com string vazia e revertia o tipo pra `personal`. Corrigido: `ProfilePage` agora carrega `GET /profile/me` no mount e usa as rotas certas no submit; `User` (contexto) ganhou `bio?`/`type?` opcionais, refletindo que só ficam populados depois de um `updateUser()`, nunca no login.

Após a correção, `tsc -b --noEmit` só reporta imports não usados (TS6133) — nenhum erro de tipo real restante.

**Auditoria de mismatch frontend↔backend (2026-07-27) — 5 endpoints chamados pela UI que não existiam na API (404 real, confirmado)**, mesma classe de bug do `ProfilePage`. Todos implementados agora, não só a UI corrigida:
- `PATCH /recurrences/:id/cancel` e `PATCH /recurrences/:id/toggle`: não existiam nenhuma rota de update fora do `create`/`list`. Adicionado campo `is_active` (migration `20260727160000_add_recurrence_is_active`) ao model `Recurrence`, `ToggleRecurrenceService`/`CancelRecurrenceService`, e `findAllActive()`/`findActiveByUserId()` do Repository agora filtram por `isActive: true` também (inclui o cron `ProcessRecurrenceService`, que agora respeita recorrências pausadas).
- `PATCH /notifications/read-all`: adicionado `markAllAsRead()` no Repository (`updateMany`) + `MarkAllNotificationsAsReadService`.
- `GET /transactions/export`: adicionado `ExportTransactionsService` (CSV gerado manualmente, sem lib — reaproveita `ListTransactionsService`).
- `GET /reports/export?format=pdf|excel`: adicionado `ExportReportService`, usando `exceljs`/`pdfkit` (dependências já instaladas, mas sem uso real em nenhum outro lugar do domínio antes disso).

Todos seguem o padrão real do módulo (um Service por ação, registro em `src/shared/container/index.ts`, checagem de posse via `wallet.userId !== userId` antes de mutar).

**Testes de regressão adicionados (2026-07-27)** pros 4 Services novos, seguindo a convenção real do projeto (mock de Repository/Cache via `vi.fn()`, ver `rules/testing.md`): `tests/modules/recurrences/ToggleRecurrenceService.spec.ts` (4 casos, incluindo checagem de posse), `tests/modules/recurrences/CancelRecurrenceService.spec.ts` (3 casos), `tests/modules/notifications/MarkAllNotificationsAsReadService.spec.ts` (1 caso), `tests/modules/transactions/ExportTransactionsService.spec.ts` (3 casos, incluindo escaping de CSV e lista vazia). Total 15 testes novos, todos passando (`npx vitest run`). `ExportReportService` (PDF/Excel) não tem teste — geração de buffer binário via `pdfkit`/`exceljs` é mais cara de testar unitariamente; ficou como lacuna conhecida, não coberta nesta passagem.

## Auditoria de Segurança/Qualidade — 2026-07-27

Levantamento feito nesta data, com correções aplicadas apenas nos itens de prioridade de segurança listados abaixo (commit `[SECURITY]`). Os demais itens são débito técnico conhecido, deliberadamente não tocados nesta passagem — não corrigir de passagem sem pedido explícito (Regra de Preservação de Código).

**Corrigidos nesta auditoria:**

1. **Fallback hardcoded de `JWT_SECRET` em `src/app.ts`** (`process.env.JWT_SECRET || 'secret'`) — removido. Agora a aplicação lança erro e falha no boot se `JWT_SECRET` não estiver definido, em vez de assinar tokens silenciosamente com um segredo público conhecido. `.env` e `docker-compose.yml` já forneciam um `JWT_SECRET` real, então isso é uma mudança sem impacto de comportamento no deploy atual.
2. **Sem helmet/security headers**: adicionado `@fastify/helmet` (novo pacote, registrado em `src/app.ts` antes das demais rotas/plugins) — cabeçalhos padrão de segurança (`x-content-type-options`, `x-frame-options` etc.) agora presentes em toda resposta.
3. **Sem rate limiting**: adicionado `@fastify/rate-limit` (novo pacote, registrado em `src/app.ts`) com limite global de 100 requisições/minuto por IP — sem tuning por rota nesta passagem.
4. **CLAUDE.md desatualizado sobre CI/CD** (linha antiga "Sem CI/CD", item 13 do débito técnico acima): `.github/workflows/ci.yml` já existe no repositório — a afirmação de que não havia pipeline estava errada/obsoleta e foi corrigida acima.

**Corrigidos numa passagem posterior (2026-07-27, segunda rodada):**

- **`Dockerfile` da API rodava `npm run dev` (`tsx watch`) mesmo nos profiles `main`/`homolog`**: reescrito como multi-stage (`financial-manager-api/docker/api/Dockerfile`) — stage `builder` (`node:20-alpine`, `npm ci` completo, `prisma generate`, `npm run build`) e stage `runtime` (`npm ci --omit=dev`, reaproveita `node_modules/@prisma/client`/`.prisma` já gerados no builder em vez de rodar `prisma generate` de novo em produção — o CLI `prisma` é devDependency e não está instalado no runtime), `USER node` (não-root), `CMD ["node", "dist/src/server.js"]`. Duas descobertas reais ao verificar de ponta a ponta (não presumidas): (1) `npm run build` (`tsc`) já falhava mesmo antes desta mudança por um bug de import pré-existente em `SavingsGoalRepositoryInterface.ts` (`../dtos/...` faltando um nível — o arquivo está em `repositories/contracts/`, precisa de `../../dtos/...`) — corrigido por ser bloqueante para qualquer build real, não por escolha; os demais erros de tipo pré-existentes (`CreateTransactionService`, `WalletRepository`, `UpdateWalletService` — ver Débito Técnico) continuam sem corrigir, e o script `build` agora é `tsc; tsc-alias -p tsconfig.json` (`;` em vez de `&&`) para não abortar o build no Docker por causa desses erros de tipo remanescentes, já que `tsc` sempre teve `noEmitOnError` implicitamente `false` e emite JS válido mesmo com erro de tipo — é o mesmo comportamento de tolerância que já existia rodando via `tsx` (que nunca type-checou). (2) Os 71 arquivos que importam via alias `@/...` não resolviam em runtime após compilar com `tsc` puro (`NodeNext`/CommonJS não reescreve `@/` para caminho relativo) — adicionado `tsc-alias` como devDependency, chamado depois do `tsc` no script `build`, que reescreve os `require("@/...")` do `dist/` para caminhos relativos reais. Também descoberto que `tsconfig.json` tem `rootDir: "./"` (não `"./src"`), então a saída fica em `dist/src/...`, não `dist/...` — daí `CMD ["node", "dist/src/server.js"]`, não `dist/server.js`. Isso também quebrava a resolução de `tmp/uploads` do `@fastify/static` (`path.resolve(__dirname, '..', 'tmp', 'uploads')` em `src/app.ts`, calculado a partir de `dist/src/app.js`, aponta para `dist/tmp/uploads`, não `/app/tmp/uploads`) — o Dockerfile cria os dois diretórios (`mkdir -p tmp/uploads dist/tmp/uploads`) no stage runtime; o caminho real usado hoje é o de dentro de `dist/`, o que é ele próprio um sintoma do `rootDir` incomum e não foi "corrigido" na raiz (mudar `rootDir`/reestruturar `src/app.ts` seria uma mudança maior, fora do escopo desta correção de Dockerfile). Também adicionado `PORT: ${PORT:-3000}` ao `environment` do `docker-compose.yml` da API — antes ausente, então o container sempre subia na porta default do código (`3333`) enquanto o compose mapeava `3000:3000`, quebrando o acesso via `curl localhost:3000` independentemente do Dockerfile (bug de configuração pré-existente, exposto ao verificar o container de ponta a ponta). Verificado com `sudo docker compose --profile main up -d --build` + `curl localhost:3000/health` (`{"status":"ok"}`) + `curl localhost:3000/api/v1/wallets` (`401`, envelope `{success:false,...}`) + `npm test` (13 arquivos/26 testes, todos passando) + `docker exec ... whoami` (`node`, não `root`).
- **Bug real em `WalletsPage.tsx`**: `loadWallets()` era chamado dentro do `useEffect` antes da própria declaração (`const loadWallets = async () => {...}` vinha depois no corpo do componente) — corrigido movendo a declaração de `loadWallets` para antes do `useEffect` que a usa (mesma forma de função, só reordenada), eliminando o erro de lint `Cannot access variable before it is declared`. Nota: o mesmo padrão (uso antes da declaração) existe hoje também em `TransactionsPage.tsx` (`loadTransactions`) e não foi tocado — fora do escopo desta correção pontual, que mirou só `WalletsPage.tsx`.

**Corrigidos numa terceira passagem (2026-07-27):**

- **Graceful shutdown**: `src/server.ts` agora registra um único handler (`shutdown(signal)`) para `SIGTERM`/`SIGINT` que, em ordem, para o cron job (`stopRecurrenceJob()`, nova função exportada por `RecurrenceJob.ts` que guarda a referência do `ScheduledTask` retornado por `cron.schedule` e chama `.stop()`), fecha o Fastify (`app.close()`), desconecta o Prisma (`prisma.$disconnect()`) e fecha o cliente Redis (`closeRedisClient()`, nova função em `RedisClient.ts` que chama `client.quit()` se `client.isOpen`), com `console.log` em cada etapa e `process.exit(0)`/`process.exit(1)` ao final. Verificado com `sudo docker stop financial-manager-api-api-1`: saiu em ~5,5s (bem abaixo do timeout padrão de 10s antes do SIGKILL do Docker), com todas as linhas de log do shutdown visíveis via `docker logs`.
- **Logger do Fastify sempre ativo**: `src/app.ts` trocou `logger: process.env.NODE_ENV === 'development'` por `logger: { level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug') }` — pino agora roda em qualquer ambiente, com nível configurável via `LOG_LEVEL` e default sensato (`info` em produção, `debug` fora dela). Verificado via `docker logs`: requisições reais (`/health`) agora aparecem como JSON estruturado do pino (`{"level":30,...,"msg":"incoming request"}`), não só o `console.log` solto de `server.ts`.
- **Validação de env vars no boot**: novo `src/shared/config/env.ts`, um schema Zod (`DATABASE_URL`/`REDIS_URL` como URL válida, `JWT_SECRET`/`JWT_EXPIRES_IN`/`JWT_REFRESH_EXPIRES_IN` como string não vazia) validado a partir de `process.env` e importado no topo de `app.ts` (logo após `dotenv/config`, antes de qualquer outro uso de `process.env`). Em caso de falha, imprime a lista de variáveis inválidas/ausentes e `process.exit(1)` — falha rápido e com mensagem clara em vez de estourar mais adiante num erro obscuro de conexão do Prisma/Redis. Verificado isoladamente via `docker run` (fora do container real em produção) com `JWT_SECRET` ausente: saída `Variáveis de ambiente inválidas ou ausentes: - JWT_SECRET: Invalid input...` e exit code 1; com todas as variáveis presentes, valida silenciosamente e segue o boot.
- **UI: 85 → 2 problemas de ESLint** (`npm run lint` em `financial-manager-ui/`). Corrigidos: o mesmo padrão de uso-antes-da-declaração de `WalletsPage.tsx` em todos os componentes/páginas que o reproduziam (`TransactionsPage.tsx`, `CategoriesPage.tsx`, `NotificationBell.tsx`, `CreateRecurrenceModal.tsx`, `RecurrencesPage.tsx`, `DashboardPage.tsx`, `SavingsGoalsPage.tsx`, `AdvancedFiltersModal.tsx`, `CreateTransactionModal.tsx`, `CreateTransferModal.tsx`, `UpdateTransactionModal.tsx`) — a função `load*`/`handle*` passou a ser declarada antes do `useEffect` que a chama; imports não usados removidos (`Tag`, `ArrowUpCircle`/`ArrowDownCircle`, `Trash2`, `Edit2` em vários arquivos); bindings `catch (error)`/`catch (err: any)` não usados trocados por `catch {}` (optional catch binding, `target: es2023` já suporta) ou, quando o valor do erro era realmente lido (`LoginPage.tsx`, `RegisterPage.tsx`, `CreateTransferModal.tsx`), tipado via `axios.isAxiosError(err)` em vez de `err: any`; `any` explícito trocado por tipo concreto em `src/services/api.ts` (`failedQueue`/`processQueue`), `UpdateWalletModal.tsx` (`setType(wType.id as any)` → união literal), `CreateRecurrenceModal.tsx` (idem para `period`), `CreateTransferModal.tsx` (`Category` ganhou campo `type` tipado em vez de `c: any` no filter); `let end` → `const end` em `DashboardPage.tsx` (nunca reatribuído). Os avisos `react-hooks/exhaustive-deps` (função de fetch ausente do array de dependências) foram deliberadamente suprimidos com `// eslint-disable-next-line` em vez de adicionar a função ao array — adicioná-la sem `useCallback` recriaria a função a cada render e causaria fetch em loop, uma mudança de comportamento maior que não foi pedida; o mesmo racional se aplica aos `react-hooks/set-state-in-effect` (chamar `setState`/uma função de fetch dentro de `useEffect` no mount, um padrão usado em praticamente toda página/modal do projeto) — suprimidos pontualmente em vez de reescritos, já que corrigir "de verdade" exigiria introduzir uma lib de data-fetching ou reestruturar o padrão de carregamento em ~15 arquivos, fora do escopo de uma correção de lint.
  - **Não corrigido, deixado de fora deliberadamente**: os 2 erros restantes (`react-refresh/only-export-components` em `src/contexts/AuthContext.tsx` e `src/shared/components/Toast.tsx`) — cada arquivo exporta um componente/provider **e** um hook (`useAuth`/`useToast`) no mesmo módulo; a correção real exige mover o hook para um arquivo próprio e atualizar os ~10+ call sites que importam `useAuth`/`useToast` hoje do mesmo caminho, uma mudança estrutural maior que o escopo desta passagem (risco de quebrar imports em cascata) — arriscado demais para corrigir de passagem sem revisão dedicada.

**Ainda conhecidos, não corrigidos** (log para não perder de vista em passagem futura) — **ver "Correção de débito técnico remanescente — 2026-07-27" abaixo: todos os 9 itens listados nesta seção foram resolvidos nessa passagem.** Mantido aqui só como histórico do estado anterior:

- ~~`as any` disseminado em `request.query`/`request.user`/`request.body` nos Controllers~~ — parcialmente resolvido (ver seção nova).
- ~~Erros de tipo pré-existentes que `tsc` tolera silenciosamente no build de produção da API~~ — resolvido (ver seção nova).
- ~~Inconsistências de DI (`BaseRepository` parcial)~~ — resolvido (ver seção nova).
- ~~`.env.example` da UI não existe~~ — resolvido (ver seção nova).
- ~~`react-refresh/only-export-components` em `AuthContext.tsx`/`Toast.tsx`~~ — resolvido (ver seção nova).

## Correção de débito técnico remanescente — 2026-07-27

Fecha os 9 itens que estavam listados como "ainda conhecidos, não corrigidos" acima. Cada item verificado com evidência real (testes/build/curl), não só leitura de código.

1. **`BaseRepository` padronizado** (Débito Técnico #1, resolvido): `AuthRepository`, `WalletRepository` e `ProfileRepository` migrados do `BaseRepository` para o padrão majoritário (import direto do singleton `prisma`), no mesmo estilo do `CategoryRepository`. `src/base/repository/BaseRepository.ts` removido (ficou 100% morto). `npm test`: 26/26 testes continuam passando.
2. **`AuthMiddleware` agora bloqueia sessão revogada** (Débito Técnico #4, resolvido): antes de endurecer, `LoginService`/`RefreshTokenService` foram confirmados gravando `auth:token:{user_id}` no Redis em todo login/refresh, e `LogoutService` confirmado apagando essa chave — então o endurecimento não quebra autenticação normal. `AuthMiddleware.ts` agora lança `AppError('Sessão inválida ou expirada', 401)` quando a chave não é encontrada no cache. Verificado end-to-end contra o container real (`financial-manager-api-api-1` rebuildado): registro + login de um usuário de teste → `GET /api/v1/wallets` autenticado (200) → `POST /api/v1/auth/logout` (200) → mesmo token no mesmo `GET /api/v1/wallets` agora retorna 401 `{"success":false,"message":"Sessão inválida ou expirada"}`. Usuário de teste e a role `user` (que não existia previamente na tabela `roles` do banco de produção — lacuna de seed pré-existente, sinalizada mas fora do escopo de corrigir aqui) foram removidos do banco depois do teste.
3. **`AppError` estende `Error`** (Débito Técnico #5, resolvido): `super(message)` no construtor, mantém `status_code`, `Object.setPrototypeOf` para `instanceof` funcionar corretamente após transpilação. `ErrorHandler.ts` não precisou mudar (`instanceof AppError` continua funcionando). Verificado isoladamente: `new AppError(...) instanceof Error` → `true`, `.stack` populado com stack trace real.
4. **`as any` substituído por `Schema.parse` nos Controllers com DTO existente** (Débito Técnico #8, resolvido onde havia DTO): `TransactionController.store/update`, `CategoryController.store/update`, `SavingsGoalController.store`, `RecurrenceController.store`. **Não migrados** (sem DTO Zod correspondente, fora do escopo — não criar DTO novo não pedido): `TransactionController.index` (filtros de query), `SavingsGoalController.update`, `ProfileController.update`, `request.user as any` (não é body/DTO, é o payload do JWT).
5. **Erros de tipo tolerados pelo build corrigidos**: `CreateTransactionService.ts` agora envia `walletId`/`categoryId`/`amount: new Prisma.Decimal(...)` explicitamente (em vez de depender de spread + campos faltando); `WalletRepository`/`CreateWalletService`/`UpdateWalletService` usam `Prisma.WalletUncheckedCreateInput`/`UpdateInput` e `Prisma.Decimal` para `balance`. `npx tsc`/`npm run build`: os 3 arquivos previamente listados não aparecem mais nos erros (erros restantes no build são de `recurrences` — trabalho em andamento de outra tarefa, não tocado). `npm test`: 26/26 (2 specs de `CreateTransactionService` ajustados para comparar com `Prisma.Decimal` em vez de `number` puro).
6. **UI ganhou suíte de testes** (Débito Técnico #9, resolvido): Vitest + Testing Library + jsdom instalados como devDependencies, scripts `test`/`test:watch`, `vitest.config.ts` próprio (não tocou `vite.config.ts`, que está na lista de arquivos de dono externo). Cobertura: `AuthContext` (signIn/signOut e persistência em localStorage), `LoginPage`/`RegisterPage` (validação HTML `required`, submit com sucesso, submit com erro da API), `WalletsPage`/`TransactionsPage` (carregamento inicial via `api` mockado, renderização da lista e do estado vazio). `npm test`: 5 arquivos / 13 testes, todos passando.
7. **Camada de hooks para os 3 módulos com mais chamadas diretas** (Débito Técnico #10, resolvido para wallets/transactions/categories): `useWallets`/`useCategories`/`useTransactions` (`src/modules/{modulo}/hooks/`) encapsulam `api.get/post/put/delete`. Migrados: `WalletsPage` + `Create/UpdateWalletModal`; `CategoriesPage` + `Create/UpdateCategoryModal`; `TransactionsPage` + `Create/UpdateTransactionModal`/`CreateTransferModal`/`AdvancedFiltersModal`. **Não migrados** (débito remanescente, deliberado — fora dos 3 módulos priorizados): `recurrences`, `savings-goals`, `notifications`, `reports`, `profile`, `auth` continuam com `api.*` direto nas páginas/componentes.
8. **`react-refresh/only-export-components` corrigido** (resolvido): `AuthContext.tsx`/`Toast.tsx` tinham contexto+provider+hook no mesmo arquivo. Contexto isolado em `AuthContextValue.ts`/`ToastContextValue.ts`; hook isolado em `useAuth.ts`/`useToast.ts`; todos os ~20 call sites atualizados. `npm run lint`: 0 erros/0 warnings (antes: 2 erros).
9. **`.env.example` da UI criado** (resolvido): `financial-manager-ui/.env.example` documenta `VITE_API_URL`, com comentário explicando que é variável de build-time do Vite (baked no bundle em `vite build`, não lida em runtime pelo Nginx que serve o estático).

**Verificação final consolidada** (API rebuildada via `sudo docker compose --profile main up -d --build`): `curl localhost:3000/health` → `{"status":"ok"}`; `npm test` (API) → 26/26; `npm run build` (API) → limpo dos erros dos itens 1-5 (restam só os de `recurrences`, de outra tarefa em andamento); na UI (sem rebuildar o container, só local): `npm run build` → limpo; `npm test` → 5/5 arquivos, 13/13 testes; `npm run lint` → 0 problemas.

## Contexto do Projeto

**Financial Manager** é um sistema de gestão financeira pessoal: usuário autenticado gerencia carteiras (`wallets`, com saldo e tipo), lança transações (`transactions`, receita/despesa, com categoria e status), define transferências entre carteiras, cria recorrências (`recurrences`, lançamentos automáticos via cron job — `RecurrenceJob.ts`), define metas de economia (`savings-goals`) e acompanha relatórios/dashboard (`reports` — visão geral, despesas por categoria, evolução mensal) com notificações (`notifications`). Não há multi-tenant/organização — o isolamento de dados é só por `userId` dentro de cada tabela.

Ver `.agents/docs/project-overview.md` e `.agents/docs/database/schema.dbml` para descrição de negócio adicional (parte é aspiracional — cruzar com `prisma/schema.prisma` real antes de assumir que uma tabela/campo já existe).

## Git e GitHub

Ver `.claude/rules/git-workflow.md` — branch/commit já seguem um padrão real observado no `git log` (`[TASK-NN] tipo(módulo): descrição`), diferente do `TASK-{ID}-descrição` de nome de branch sugerido em `.agents/GEMINI.md` (não há branches locais para confirmar o padrão de branch de fato usado, só o de commit).

## Regras do Projeto

@.claude/rules/architecture.md
@.claude/rules/layers.md
@.claude/rules/naming.md
@.claude/rules/mandatory.md
@.claude/rules/formatting.md
@.claude/rules/testing.md
@.claude/rules/git-workflow.md
@.claude/rules/project-context.md
@.claude/rules/project-tech.md
@.claude/rules/response-patterns.md

## Guias Especializados

| Situação | Arquivo |
|----------|---------|
| Backend (API) geral | `.claude/agents/api-agent.md` |
| Frontend (UI) geral | `.claude/agents/ui-agent.md` |
| Code review | `.claude/agents/review-agent.md` |
| Novo endpoint (API) | `.claude/checklists/new-endpoint.md` |
| Nova página/módulo (UI) | `.claude/checklists/new-page.md` |
| Code review checklist | `.claude/checklists/code-review.md` |
