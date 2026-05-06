# Frontend Components Guide

## Objetivo

Componentes sao a camada de exibicao. Devem ser simples, reutilizaveis e focados em interface.

## Responsabilidades

- renderizar UI;
- receber props;
- disparar callbacks;
- compor layout e feedback visual.

## O Que Nao Fazer

- nao chamar API diretamente;
- nao conter regra de negocio;
- nao crescer ao ponto de concentrar toda a feature.

## Checklist

- o componente esta focado em exibicao?
- a logica foi extraida para hook quando necessario?
- a comunicacao externa nao esta acoplada ao JSX?
