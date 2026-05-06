# Backend Routing Guide

## Objetivo

As rotas devem ser organizadas por dominio, com nomes previsiveis e versionamento explicito.

## Regras Gerais

- toda API deve ser versionada por URL;
- o padrao esperado e `/api/v1/...`;
- rotas devem ser nomeadas explicitamente;
- nomes de rota devem seguir `dot.case`.

## Ponto de Entrada

O arquivo `routes/api.php` deve ser um ponto de entrada limpo, responsavel por:

- aplicar prefixo de versao;
- aplicar middleware global de autenticacao, quando fizer sentido;
- carregar arquivos de rota por dominio.

## Organizacao Recomendada

Estrutura sugerida:

- `routes/api.php`
- `routes/api/users.php`
- `routes/api/projects.php`
- `routes/api/teams.php`
- `routes/api/teams/members.php`

## Padrao de Agrupamento

- agrupar por recurso;
- usar `prefix()` para URI;
- usar `name()` para nome da rota;
- usar `middleware()` no nivel correto;
- manter sub-recursos em arquivos aninhados quando a complexidade justificar.

## Exemplos de Nome

- `users.index`
- `users.store`
- `users.show`
- `users.update`
- `schools.classes.students.show`

## Leitura Recomendada Antes de Alterar Rotas

1. `routes/api.php`;
2. arquivo de rota do dominio;
3. controller relacionado;
4. policy ou middleware relacionado;
5. rule de API para versionamento e resposta.

## Checklist de Rota

- a rota esta versionada?
- o nome esta explicito?
- o dominio esta no arquivo certo?
- middleware e permissao estao na camada correta?
- a rota aponta para o controller certo?

## Norte Pratico

Se `routes/api.php` estiver crescendo demais, extraia por dominio.
