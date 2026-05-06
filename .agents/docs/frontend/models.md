# Frontend Models Guide

## Objetivo

Models adaptam dados recebidos da API para uso previsivel no frontend.

## Responsabilidades

- definir defaults;
- padronizar formato de leitura;
- proteger a UI de dados inconsistentes ou incompletos.

## O Que Nao Fazer

- nao conter regra de negocio complexa;
- nao chamar API;
- nao substituir service ou hook.

## Checklist

- o model melhora previsibilidade da UI?
- existem defaults seguros?
- a adaptacao esta alinhada ao contrato da API?
