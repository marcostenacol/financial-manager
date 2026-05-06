# Frontend Modules Guide

## Objetivo

O frontend deve ser organizado por dominio, com modulos independentes e previsiveis.

## Estrutura Esperada

- `modules/home`
- `modules/products`
- `modules/cart`
- `modules/checkout`
- `modules/orders`
- `modules/auth`

## Estrutura de Modulo

Quando necessario, um modulo pode conter:

- `components`
- `dtos`
- `hooks`
- `models`
- `routes`
- `services`
- `validators`

## Regra de Uso

- paginas montam experiencia a partir de modulos;
- modulos concentram a logica do dominio;
- `common` recebe apenas o que e compartilhado por varios dominios.
