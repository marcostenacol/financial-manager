# Backend Docs Index

## Objetivo

Este diretorio e a base de referencia do backend. O agent principal consulta este indice para decidir onde pesquisar conforme o tipo de tarefa.

## Como Usar

Se a tarefa for:

- arquitetura ou camada correta: leia `.agents/docs/backend/architecture-summary.md`
- contrato de API: leia `.agents/docs/backend/index.md`
- qualidade de codigo: leia `.agents/docs/backend/STANDARDS.md`
- banco de dados: leia `.agents/docs/backend/database.md`
- controller: leia `.agents/docs/backend/controllers.md`
- service: leia `.agents/docs/backend/services.md`
- repository: leia `.agents/docs/backend/repositories.md`
- request: leia `.agents/docs/backend/requests.md`
- resource: leia `.agents/docs/backend/resources.md`
- rotas: leia `.agents/docs/backend/routing.md`
- nomenclatura: leia `.agents/docs/backend/naming-conventions.md`
- testes e TDD: leia `.agents/docs/backend/testing-tdd.md`

## Mapa Rapido de Pesquisa

### Endpoint novo ou alterado

Leia nesta ordem:

1. `routes/api.php`
2. `routes/api/` ou estrutura equivalente
3. `app/Http/Controllers`
4. `app/Http/Requests`
5. `app/Http/Resources`
6. `app/Services`
7. `app/Repositories`
8. `app/Models`

### Regra de negocio

Leia nesta ordem:

1. `app/Services`
2. `app/Repositories`
3. `app/Models`
4. `app/Jobs`, se houver processo assincrono

### Banco de dados

Leia nesta ordem:

1. `.agents/docs/backend/database.md`
2. `database/migrations`
3. `database/seeders`
4. `app/Models`
5. `app/Repositories`

### Validacao

Leia nesta ordem:

1. `app/Http/Requests`
2. `app/Rules`
3. `app/Policies`, se houver autorizacao por regra

### Resposta da API

Leia nesta ordem:

1. `app/Http/Resources`
2. trait base de resposta, se existir
3. `.agents/docs/backend/index.md`

## Convencoes Estruturais Esperadas

- `app/Http/Controllers`: fluxo HTTP
- `app/Http/Requests`: validacao e autorizacao basica
- `app/Http/Resources`: formato de saida
- `app/Services`: regra de negocio
- `app/Repositories`: persistencia
- `app/Models`: relacoes, casts e scopes
- `database/migrations`: estrutura do banco
- `database/seeders`: dados iniciais e dependencias de banco

## Proximo Documento de Referencia

Para tarefas envolvendo banco, consulte `.agents/docs/backend/database.md`.

## Documentos Disponiveis

- `.agents/docs/backend/controllers.md`
- `.agents/docs/backend/services.md`
- `.agents/docs/backend/repositories.md`
- `.agents/docs/backend/requests.md`
- `.agents/docs/backend/resources.md`
- `.agents/docs/backend/routing.md`
- `.agents/docs/backend/naming-conventions.md`
- `.agents/docs/backend/database.md`
- `.agents/docs/backend/testing-tdd.md`

## Checklists Disponiveis

- `.agents/checklists/new-endpoint.md`
- `.agents/checklists/new-entity.md`
- `.agents/checklists/code-review.md`

## Agentes Especializados

- `.agents/agents/backend-db-agent.md`
- `.agents/agents/backend-crud-agent.md`
- `.agents/agents/backend-review-agent.md`
