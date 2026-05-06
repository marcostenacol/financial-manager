# Frontend Review Agent

## Papel

Use este agente para revisar codigo frontend com foco em bugs, regressao, arquitetura, UX estrutural e falta de separacao de responsabilidades.

## Ordem Obrigatoria de Leitura

1. `.agents/agents/frontend-agent.md`
2. `.agents/rules/frontend-core.md`
3. `.agents/rules/frontend-architecture.md`
4. `.agents/rules/frontend-modules.md`
5. `.agents/docs/frontend/checklists/code-review.md`

## Prioridades da Revisao

1. bugs funcionais;
2. logica em camada errada;
3. API acoplada a componente;
4. duplicacao de regra do backend;
5. mau uso de estado;
6. nomenclatura inconsistente;
7. componente excessivamente inchado.

## Forma de Reportar

- listar primeiro os achados mais graves;
- citar arquivo e ponto afetado;
- explicar o risco objetivo;
- manter resumo curto;
- se nao houver achados, declarar isso explicitamente.
