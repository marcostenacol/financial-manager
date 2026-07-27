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

**Resolvido** (não é mais débito — mantido aqui como histórico): a UI rodava em produção via `npm run dev` (Vite dev server) — foi migrada para build de produção real (`vite build` → Nginx servindo `dist/` estático com fallback de SPA, ver `Dockerfile`/`nginx.conf`). Ao fazer essa migração, dois bugs reais e pré-existentes bloqueavam o build e foram corrigidos por serem bloqueantes (não por escolha de tocar código não solicitado): `TransactionsPage.tsx` importava `TransactionDetailModal` de um arquivo que nunca existia (criado agora, seguindo o padrão visual de `UpdateTransactionModal.tsx`); e `src/services/api.ts`/`DefaultLayout.tsx` importavam `InternalAxiosRequestConfig`/`ReactNode` sem `type`, o que quebra o bundler de produção (Rolldown/Vite) mesmo não afetando o dev server. **O build de produção usa `vite build` direto, não `npm run build`** (que roda `tsc -b` antes) — o projeto tem vários erros de tipo pré-existentes e não corrigidos (imports não usados, `User.bio`/`type` inexistente no tipo `User`, módulo de recorrência de UI) que ficam de fora do escopo do build de produção porque o Vite não type-checa, só falha em erro real de bundling. Se for pedido para reativar type-check estrito no build, esses erros precisam ser resolvidos primeiro.

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

**Ainda conhecidos, não corrigidos** (log para não perder de vista em passagem futura):

- **Sem graceful shutdown**: não há handler de `SIGTERM`/`SIGINT` fechando Fastify, Prisma, Redis e o cron job (`RecurrenceJob.ts`) de forma ordenada — um `docker stop`/redeploy pode cortar conexões/transações em andamento.
- **Logger do Fastify (`pino`) só ativo em `NODE_ENV=development`** (`src/app.ts`, `logger: process.env.NODE_ENV === 'development'`): em produção não há log estruturado nenhum vindo do Fastify — só o que cada `console.error` solto emitir (ex.: `ErrorHandler.ts`).
- **UI com dezenas de problemas reais de ESLint** (`npm run lint` em `financial-manager-ui/`) além do bug de `WalletsPage.tsx` já corrigido acima — incluindo o mesmo padrão de uso-antes-da-declaração em `TransactionsPage.tsx` e uma leva grande de `Calling setState synchronously within an effect` (`ProfilePage.tsx`, `UpdateCategoryModal.tsx`, `CreateSavingsGoalModal.tsx`, entre outros). Não corrigidos nesta passagem — fora do escopo explícito da tarefa (só `WalletsPage.tsx` foi pedido).
- **`as any` disseminado em `request.query`/`request.user`/`request.body` nos Controllers**: ver Débito Técnico #8 acima — continua não corrigido fora dos pontos já tocados por outra tarefa.
- **Erros de tipo pré-existentes que `tsc` tolera silenciosamente no build de produção da API** (ver item corrigido acima sobre o Dockerfile): `CreateTransactionService.ts` (payload de create do Prisma sem `walletId`/`categoryId`, `amount: number` passado onde o Prisma espera `Decimal`), `WalletRepository.ts` (`type` obrigatório ausente no create), `UpdateWalletService.ts` (`balance: number` vs `Decimal`). Nenhum quebra o runtime hoje (JS gerado funciona), mas são reais furos de tipagem que `strict: true` deveria estar pegando — não corrigidos por estarem fora do escopo desta tarefa (Dockerfile/WalletsPage), só documentados para não se perder.
- **Inconsistências de DI** (`BaseRepository` parcial, ver Débito Técnico #1): não tocado.
- **Sem validação de env vars no boot** (`DATABASE_URL`/`REDIS_URL`/`JWT_SECRET` — este último agora falha fast, mas os demais não são validados): sugestão é um schema Zod validado em `src/env.ts` (ou similar) importado no topo de `src/app.ts`/`src/server.ts`, falhando com mensagem clara se alguma variável obrigatória estiver ausente/malformada, em vez de falhar de forma obscura mais adiante (ex.: erro de conexão do Prisma).
- **`.env.example` da UI não existe** (`financial-manager-ui/.env.example` — verificado nesta auditoria, nem o arquivo está presente, só `.env` real): deveria ao menos existir documentando `VITE_API_URL` (ver `rules/project-tech.md`).

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
