# Frontend DTOs Guide

## Objetivo

DTOs transformam dados do frontend antes do envio ao backend.

## Responsabilidades

- adaptar nomes de campos;
- organizar payload;
- manter contrato de envio previsivel.

## O Que Nao Fazer

- nao chamar API;
- nao manipular UI;
- nao concentrar validacao visual.

## Checklist

- o backend exige formato diferente do estado interno?
- o DTO deixa o envio mais claro?
- o payload ficou previsivel e estavel?
