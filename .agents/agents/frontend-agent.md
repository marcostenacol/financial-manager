# Frontend Agent

## Papel

Este e o arquivo principal de orientacao para qualquer tarefa de frontend neste projeto. Ao receber uma solicitacao de frontend, leia este arquivo primeiro.

Objetivo:

- manter consistencia arquitetural no frontend;
- reduzir gasto de token com contexto repetido;
- indicar onde pesquisar antes de editar;
- garantir separacao clara entre UI, logica e integracao.

## Leitura Obrigatoria Inicial

Antes de propor ou editar qualquer codigo de frontend, consulte nesta ordem:

1. `.agents/rules/frontend-core.md`
2. `.agents/rules/frontend-architecture.md`
3. `.agents/rules/frontend-modules.md`
4. `.agents/rules/frontend-naming.md`
5. `.agents/docs/frontend/index.md`

## Regra Central

Sempre respeitar este fluxo:

`components exibem -> hooks orquestram -> services comunicam -> DTOs transformam -> models representam`

Regra final:

- frontend organiza experiencia;
- backend controla regra.

## Como Decidir Onde Mexer

Use estas regras para localizar a camada correta:

- renderizacao e composicao visual: `components`
- logica de tela, estado e orquestracao: `hooks`
- comunicacao com API: `services`
- definicao de endpoints: `routes`
- transformacao de payload de envio: `dtos`
- adaptacao de dados recebidos: `models`
- validacao de formularios: `validators`
- montagem de tela por rota: `pages`
- layout compartilhado: `layouts`
- recursos reutilizaveis globais: `common`

## Onde Pesquisar por Tipo de Tarefa

### 1. Nova feature

Leia nesta ordem:

1. `.agents/docs/frontend/feature-flow.md`
2. `.agents/docs/frontend/modules.md`
3. pagina relacionada em `pages/`
4. modulo relacionado em `modules/`
5. `.agents/docs/frontend/checklists/new-feature.md`

Sempre seguir a sequencia:

1. criar route
2. criar DTO, se necessario
3. criar service
4. criar hook
5. criar validator, se houver formulario
6. criar componente
7. integrar na pagina

### 2. Integracao com API

Leia nesta ordem:

1. `.agents/docs/frontend/routes.md`
2. `.agents/docs/frontend/services.md`
3. `.agents/docs/frontend/dtos.md`, se houver envio de dados
4. `.agents/docs/frontend/models.md`, se houver leitura estruturada
5. hook relacionado

Nunca chamar API direto em componente.

### 3. Formulario

Leia nesta ordem:

1. `.agents/docs/frontend/validators.md`
2. `.agents/docs/frontend/hooks.md`
3. `.agents/docs/frontend/components.md`
4. `.agents/docs/frontend/checklists/new-form.md`

### 4. Ajuste visual

Leia nesta ordem:

1. pagina ou layout relacionado
2. componente relacionado
3. modulo relacionado, se houver regra de exibicao dependente do dominio

Nao mover logica de negocio para componente so para resolver a UI.

### 5. Review de frontend

Verifique principalmente:

- logica de negocio dentro de componente;
- chamada de API no JSX;
- ausencia de hook para orquestracao;
- service manipulando UI;
- duplicacao de regra do backend;
- estado global sem necessidade;
- quebra de organizacao por modulo;
- nomes fora do padrao.

## Regras Curtas Inviolaveis

- componentes exibem, nao governam negocio;
- hooks concentram logica da feature;
- services apenas comunicam com o backend;
- routes apenas definem endpoints;
- DTOs transformam saida do frontend para envio;
- models adaptam entrada da API para consumo interno;
- validators centralizam regras de formulario;
- backend continua sendo a fonte da verdade.

## Checklist Antes de Finalizar

- a alteracao esta na camada correta?
- existe logica excessiva no componente?
- a integracao com API esta em service?
- o hook orquestra a feature?
- DTO e model foram usados quando necessario?
- a validacao esta fora do componente?
- a estrutura do modulo foi respeitada?
- os nomes seguem o padrao do projeto?

## Referencias

- `.agents/rules/frontend-core.md`
- `.agents/rules/frontend-architecture.md`
- `.agents/rules/frontend-modules.md`
- `.agents/rules/frontend-naming.md`
- `.agents/docs/frontend/index.md`

## Agentes Especializados

- features e CRUD de UI: `.agents/agents/frontend-feature-agent.md`
- formularios: `.agents/agents/frontend-form-agent.md`
- review: `.agents/agents/frontend-review-agent.md`
