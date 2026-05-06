# Frontend Services Guide

## Objetivo

Services fazem a comunicacao com o backend Laravel.

## Responsabilidades

- usar `httpClient`;
- consumir rotas centralizadas;
- transformar leitura com models quando aplicavel;
- enviar payload transformado por DTO quando necessario.

## O Que Nao Fazer

- nao manipular UI;
- nao manter estado React;
- nao conter markup;
- nao substituir hook.

## Checklist

- o service apenas comunica com backend?
- a rota veio da camada `routes`?
- existe model para leitura quando apropriado?
- existe DTO para envio quando apropriado?
