# Frontend Architecture Guide

## Objetivo

O frontend deve ser escalavel, modular, orientado a dominio e alinhado ao backend Laravel.

## Principios

- UI desacoplada da logica;
- componentes nao possuem regra de negocio;
- hooks concentram orquestracao;
- services comunicam com o backend;
- backend segue como fonte da verdade.

## Regra Central

- components exibem;
- hooks orquestram;
- services comunicam;
- DTOs transformam;
- models representam.
