# Checklist — Nova página/módulo (UI)

- [ ] Módulo identificado/criado em `src/modules/{modulo}/` (`components/`, `pages/`)
- [ ] Página em `{Modulo}Page.tsx`, chamando `api` de `src/services/api.ts` direto (sem service/hook intermediário — padrão atual)
- [ ] Modal/formulário em `{Ação}{Entidade}Modal.tsx` dentro de `components/`, se aplicável
- [ ] Rota adicionada em `src/routes/index.tsx`, envolta em `<ProtectedRoute>` se exigir usuário logado
- [ ] Link de navegação adicionado em `src/shared/components/Sidebar.tsx`, se for uma seção principal
- [ ] Estilo via Tailwind + `clsx`/`tailwind-merge` — sem CSS novo fora do padrão utilitário
- [ ] Erros de chamada à API tratados (toast via `src/shared/components/Toast.tsx`, se já for o padrão usado em módulos vizinhos)
- [ ] `npm run lint` sem novo warning/erro
- [ ] Confirmado que `VITE_API_URL`/porta usada bate com a API real (`3000`, prefixo `/api/v1`) antes de depurar erro de conexão
- [ ] `.agents/PROGRESS.md` (seção Frontend) atualizado, se aplicável
