# Workflow: Criar Novo Módulo Frontend (Nuxt 3)

Este workflow define como expandir a interface modular.

## 🛠️ Passo a Passo

### 1. Criar Pasta do Módulo
Crie a estrutura em `modules/{domain}/`.
// turbo
`mkdir -p modules/{domain}/components modules/{domain}/pages modules/{domain}/store modules/{domain}/services modules/{domain}/composables`

### 2. Definir o Service de API
Crie o service que consome o endpoint modular do backend.
- Siga `.agents/docs/frontend/services.md`
- Utilize o padrão de tipos (TypeScript).

### 3. Criar a Store (Pinia)
Se o módulo exigir estado global.
- Siga `.agents/docs/frontend/architecture.md`.

### 4. Desenvolver Componentes
Crie componentes atômicos em `modules/{domain}/components/`.
- Siga `.agents/docs/frontend/components.md` (Atomic Design).

### 5. Definir Rotas e Páginas
Crie as páginas e vincule-as ao layout principal.

---
> [!TIP]
> Garanta que os nomes das variáveis no Frontend (camelCase) correspondam ao mapeamento do Backend (snake_case).
