# Frontend Validators Guide

## Objetivo

Validators centralizam validacao de formularios e mantem componentes limpos.

## Responsabilidades

- definir schema de validacao;
- integrar com mecanismo de formulario;
- manter mensagens e regras de entrada fora da UI.

## O Que Nao Fazer

- nao conter logica de submit;
- nao chamar API;
- nao centralizar exibicao.

## Checklist

- a validacao esta fora do componente?
- o formulario usa validator centralizado?
- regras de entrada estao claras?
