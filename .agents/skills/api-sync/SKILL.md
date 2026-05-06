---
name: api-sync
description: >
  Sincroniza modelos, recursos e tipos de dados entre o Banco de Dados, o Backend e o Frontend. Ative esta skill quando houver mudanças no schema do banco de dados ou nos contratos de API.
---

# Skill: Sincronização de Contrato de API

Esta skill garante a consistência de dados entre Banco de Dados -> Backend -> Frontend.

## 🧐 Quando Usar
- Ao criar ou alterar colunas em tabelas.
- Ao atualizar o `Resource` de uma entidade.
- Ao sincronizar tipos com o Frontend.

## 🛠️ Instruções de Execução

1.  **Validar o Model**: Garanta que a nova coluna esteja no `fillable` ou `casts` do Model PHP.
2.  **Atualizar o Resource**: Adicione o campo no Resource correspondente, garantindo a transformação de tipos (ex: cast para float ou bool).
3.  **Mapear para o Frontend**:
    - Se o campo no DB é `is_active`, no JSON será `is_active`.
    - Informe ao desenvolvedor para atualizar o DTO/Interface no Nuxt 3 para `isActive` (camelCase).
4.  **Documentação**: Atualize as definições de rotas se o payload de entrada mudar.

---
> [!IMPORTANT]
> Nunca exponha campos sensíveis (como IDs internos sequenciais ou senhas) no Resource. Use UUIDs.
