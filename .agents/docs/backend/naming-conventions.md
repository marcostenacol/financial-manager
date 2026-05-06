# Backend Naming Conventions Guide

## Objetivo

Nomenclatura consistente reduz ambiguidade e acelera manutencao. Todo nome deve indicar claramente responsabilidade e intencao.

## Convencoes PHP

### Classes, Interfaces, Traits e Enums

- usar `PascalCase`;
- nomear de forma explicita.

Exemplos:

- `ProjectController`
- `CreateProjectService`
- `UserRepository`
- `OrderStatusEnum`

### Metodos e Funcoes

- usar `camelCase`;
- nomear com verbos ou acoes claras.

Exemplos:

- `getUserById()`
- `calculateTotalValue()`
- `dispatchInvoiceEmail()`

### Variaveis e Propriedades

- usar `snake_case` quando esse for o padrao interno do projeto;
- sempre priorizar nomes descritivos.

Exemplos:

- `$request_data`
- `$active_users`
- `$pagination_params`

### Constantes

- usar `UPPER_SNAKE_CASE`.

Exemplos:

- `DEFAULT_PAGINATION`
- `MAX_RETRY_ATTEMPTS`

## Sufixos por Camada

- controller: `Controller`
- service: `Service`
- repository: `Repository`
- request: `Request`
- resource: `Resource`
- job: `Job`
- policy: `Policy`
- rule customizada: nome semantico de regra

## Convencoes de Arquivo

### Migrations

Padrao:

- `YYYY_MM_DD_HHMMSS_create_nome_da_tabela_table.php`

Objetivo:

- manter ordem cronologica e previsibilidade de execucao.

### Seeders

Padrao arquitetural desejado:

- `S001_NomeSeeder.php`
- `S002_StatusSeeder.php`
- `S010_UserSeeder.php`

Objetivo:

- garantir ordem deterministica quando houver dependencia entre seeders.

Observacao:

- se o projeto atual ainda nao usa esse formato, trate como norte para evolucao futura.

## Convencoes de Rotas

- nomes devem seguir `dot.case`;
- nomes devem refletir recurso e acao;
- rotas aninhadas devem refletir a hierarquia.

Exemplos:

- `projects.store`
- `users.index`
- `schools.classes.students.show`

## Checklist de Nomeacao

- o nome revela a responsabilidade?
- o sufixo da classe corresponde a camada?
- o arquivo acompanha o nome da classe?
- a rota esta nomeada com clareza?
- migration e seeder seguem padrao previsivel?
