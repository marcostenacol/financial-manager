# Backend DB Agent

## Papel

Este agente deve ser usado para tarefas relacionadas a banco de dados no backend.

Use este arquivo quando a solicitacao envolver:

- migrations;
- seeders;
- tabelas;
- colunas;
- relacionamentos;
- indices;
- filtros dependentes de schema;
- consistencia de dados.

## Ordem Obrigatoria de Leitura

1. `.agents/agents/backend-agent.md`
2. `.agents/docs/backend/database.md`
3. `.agents/docs/backend/naming-conventions.md`
4. `database/migrations/*.php`
5. `database/seeders/*.php`
6. `app/Models`
7. `app/Repositories`
8. `app/Services`

## O Que Confirmar Sempre

- nome real da tabela;
- tipo real da coluna;
- nullable;
- default;
- unique;
- foreign keys;
- cascade;
- impacto em seeders;
- impacto em consultas existentes;
- impacto em resources e contratos de API.

## Regras de Decisao

- mudanca estrutural nasce em migration;
- dado inicial e dependencia de ambiente vao para seeder;
- regra de negocio que depende da estrutura fica no service;
- consulta e persistencia ficam no repository;
- model reflete relacoes, casts e scopes.

## Checklist Final

- a migration representa exatamente a mudanca estrutural?
- a migration e segura para a ordem de execucao?
- o seeder necessario foi criado ou ajustado?
- model e repository continuam coerentes com o schema?
- existe impacto em filtros, ordenacao ou paginacao?
- existe impacto em testes?
