# Workflow: Migração de Banco de Dados (PostgreSQL)

Este workflow garante a integridade e organização dos schemas do banco de dados.

## 🛠️ Passo a Passo

### 1. Criar Arquivo de Migração
// turbo
`php artisan make:migration create_{table_name}_table`

### 2. Definir o Schema e Tabela
Edite a migração para usar o schema correto.
- **Exemplo**: `Schema::create('admin.users', ...)`
- Siga `.agents/docs/backend/database.md`

### 3. Implementar Constraints
Garanta que chaves estrangeiras e índices estejam corretos.
- Use UUIDs para IDs primários.
- Adicione `index()` em colunas de busca frequente.

### 4. Lógica PL/pgSQL (Se necessário)
Se a migração envolver funções críticas:
- Utilize `DB::unprepared` para criar funções ou triggers.
- Consulte o exemplo em `.agents/docs/backend/database.md`.

### 5. Executar e Validar
// turbo
`php artisan migrate`

### 6. Atualizar Documentação
Atualize o arquivo `.agents/docs/database/schema.dbml` se houver mudanças estruturais.

---
> [!IMPORTANT]
> **NUNCA** use o schema `public` para tabelas de domínio de negócio.
