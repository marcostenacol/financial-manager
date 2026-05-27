---
name: documentation-manager
description: >
  Mantém a documentação técnica atualizada e sincroniza instruções de agentes com o código. Ative esta skill quando precisar documentar novos fluxos, APIs ou atualizar diretrizes de desenvolvimento.
---

# Skill: Documentation Manager 📄

Esta skill permite que a automação documente o projeto de forma autônoma ou modifique instruções existentes com base em prompts específicos.

## 🛠️ Capacidades

- **Autodiscovery**: Analisa o código fonte para extrair contratos de API, regras de negócio e fluxos de dados.
- **Auto-Sync**: Mantém os arquivos em `.agents/docs/` sincronizados com a implementação real.
- **Prompt-Driven Instruction**: Modifica arquivos de diretrizes (`GEMINI.md`, agentes, checklists) com base em novas solicitações do usuário.

## 📋 Como Usar

### 1. Documentar Nova Funcionalidade
Sempre que um novo `Package` ou `Module` for criado, rode esta skill para gerar:
- `routes.md` atualizado.
- Definição de `schema.dbml` (se houver banco).
- Guia de integração para o Frontend.

### 2. Modificar Instruções Existentes
Para alterar como a IA deve se comportar (ex: "mude o padrão de nomes de variáveis"), forneça o prompt e o agente atualizará os arquivos em `.agents/checklists/` e `.agents/agents/`.

---

## 🤖 Protocolo de Execução

1.  **Exploração**: `ls -R` e `grep` para entender a mudança.
2.  **Rascunho**: Criação de um rascunho do documento em `artifacts/`.
3.  **Revisão**: Comparação com `GEMINI.md` para garantir consistência.
4.  **Escrita**: Sobrescrita ou criação do arquivo final em `.agents/`.

---
> [!TIP]
> Use o comando "Agente, documente o fluxo de [funcionalidade]" para disparar esta skill.
