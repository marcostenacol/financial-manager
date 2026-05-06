# Frontend Routes Guide

## Objetivo

Routes centralizam endpoints da API para manter previsibilidade e evitar strings espalhadas.

## Responsabilidades

- definir endpoints;
- receber parametros necessarios para montar a URL.

## O Que Nao Fazer

- nao chamar API;
- nao conter logica de negocio;
- nao acessar estado React.

## Exemplo Mental

- `getProductsRoute()` retorna URL;
- `getProductRoute(id)` retorna URL parametrizada.
