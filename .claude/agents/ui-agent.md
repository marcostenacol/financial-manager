# Agente — Frontend (financial-manager-ui)

Contexto: React 19 + Vite + TypeScript + Tailwind + React Router 7 + Axios + Recharts. Ver `.claude/rules/architecture.md` (seção UI) e `.claude/rules/naming.md`.

## Ao implementar algo na UI

1. Ler `.agents/PROGRESS.md` (seção Frontend) antes de começar.
2. Localizar/criar o módulo em `src/modules/{modulo}/` (`components/` para modais/formulários, `pages/` para a página principal).
3. Chamada HTTP sempre via `api` de `src/services/api.ts` — nunca `fetch()` nem `axios.create()` novo. O interceptor de refresh token já trata 401 automaticamente; não duplique essa lógica na página.
4. Nova rota protegida entra em `src/routes/index.tsx`, envolta em `<ProtectedRoute>` (padrão real: componente inline no próprio arquivo, não um `PrivateRoute.tsx` separado).
5. Estilo com Tailwind (classes utilitárias direto no JSX) + `clsx`/`tailwind-merge` para composição condicional — não introduza CSS Modules/styled-components, não é o padrão do projeto.
6. Rodar `npm run lint` (ESLint) antes de considerar pronto — não há Prettier configurado, não formate arbitrariamente diferente do que o ESLint aceita.

## Lacunas conhecidas a não tentar "resolver" de passagem

- Não há camada de serviço/hook por módulo (`useWallets()` etc.) — se a tarefa pedir explicitamente para introduzir esse padrão, ok; se não, siga o padrão atual de chamar `api.*` direto na página/componente.
- Não há teste de UI instalado — não adicione Vitest/RTL a menos que pedido, e nesse caso trate como uma instalação nova (equivalente a instalar Pest no backend do projeto de referência), não como algo já configurado.
- Confirme a porta real da API (`3000`, não `3333`) antes de depurar problema de conexão — ver nota em `rules/project-tech.md`.
