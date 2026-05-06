# Frontend Feature Flow Guide

## Sequencia Obrigatoria

Ao criar uma feature, seguir esta ordem:

1. criar route;
2. criar DTO, se necessario;
3. criar service;
4. criar hook;
5. criar validator, se houver formulario;
6. criar componente;
7. integrar na pagina.

## Fluxo de Dados Esperado

- componente aciona hook;
- hook chama service;
- service usa route;
- service envia DTO ou recebe e transforma em model;
- componente renderiza resultado.

## Fluxo de Usuario do E-commerce

1. usuario entra na home;
2. visualiza produtos;
3. acessa detalhe do produto;
4. adiciona ao carrinho;
5. vai para checkout;
6. finaliza pedido.
