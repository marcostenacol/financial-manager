# Frontend Hooks Guide

## Objetivo

Hooks sao a camada de orquestracao da feature.

## Responsabilidades

- controlar estado local;
- encapsular efeitos;
- integrar com services;
- expor dados, acoes e estados para a UI.

## O Que Nao Fazer

- nao virar service disfarçado;
- nao centralizar markup;
- nao duplicar regra que ja pertence ao backend.

## Checklist

- a logica da feature esta no hook?
- o retorno do hook esta claro para o componente?
- efeitos e estados estao encapsulados?
