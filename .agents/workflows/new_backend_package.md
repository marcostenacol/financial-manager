# Workflow: Criar Novo Pacote de Domínio (Backend)

Este workflow automatiza a criação de um novo módulo modular dentro de `app/Packages/`.

## 📋 Pré-requisitos
- Nome do Domínio (ex: `Payments`, `Projects`)
- Nome do Schema do Banco de Dados (ex: `finance`, `task`)

## 🛠️ Passo a Passo

### 1. Criar Estrutura de Pastas
Crie a estrutura básica do pacote.
// turbo
`mkdir -p app/Packages/{Domain}/Controllers app/Packages/{Domain}/Services app/Packages/{Domain}/Repositories app/Packages/{Domain}/Resources app/Packages/{Domain}/Models app/Packages/{Domain}/Requests`

### 2. Definir o Model
Crie o Model em `app/Packages/{Domain}/Models/` definindo o schema correto.
- Siga `.agents/docs/backend/models.md`

### 3. Criar o Repository
Implemente a interface e a classe de persistência.
- Siga `.agents/docs/backend/repositories.md`
- Utilize CTEs para consultas de leitura.

### 4. Criar o Service
Crie o Service com o método único `execute()`.
- Siga `.agents/docs/backend/services.md`
- Injete o Repository no construtor.

### 5. Criar o Controller
Crie o Controller que orquestra a chamada ao Service.
- Siga `.agents/docs/backend/controllers.md`
- Use a trait `Response` para o retorno.

### 6. Registrar Rotas
Crie o arquivo de rotas em `routes/api/v1/{domain}.php`.
- O sistema carregará automaticamente via `glob`.

### 7. Criar Teste de Feature
// turbo
`php artisan make:test Packages/{Domain}/Feature/{Action}Test --pest`
- Siga `.agents/docs/backend/testing-tdd.md`

---
> [!TIP]
> Sempre valide a performance da consulta no SQL antes de finalizar o Repository.
