---
name: git-manager
description: >
  Usa ferramentas de terminal para automatizar o fluxo de versionamento Git e GitHub. Esta skill deve ser ativada quando o usuário solicita a criação de branches, commits, push ou abertura de Pull Requests.
---

# Skill: Git Manager 🐙

Esta skill automatiza o fluxo de versionamento, garantindo conformidade com os padrões de nomenclatura de branches, commits e a criação de Pull Requests via GitHub CLI.

## 🛠️ Capacidades

- **Branch Factory**: Cria branches seguindo o padrão `TASK-{ID-JIRA}-descrição`.
- **Smart Commits**: Gera mensagens de commit no formato `[ID-JIRA] tipo(modulo):descrição`.
- **Automated PR**: Realiza o push e abre PRs utilizando `gh pr create --fill`.
- **Pre-flight Check**: Executa `gh status` e valida se há arquivos não rastreados antes de prosseguir.

## 📋 Protocolos

### 1. Criar Nova Branch
Sempre que uma nova tarefa for iniciada, extraia o ID do Jira e crie a branch:
// turbo
`git checkout -b TASK-{ID-JIRA}-{descrição}`

### 2. Commitar Mudanças
Ao finalizar uma alteração, agrupe os arquivos e commite:
// turbo
`git commit -m "[ID-JIRA] {tipo}({modulo}): {descrição}"`

### 3. Abrir Pull Request
Após o push, dispare a criação do PR:
// turbo
`gh pr create --fill`

## 🤖 Regras de Execução

1.  **Validação**: Verifique o status do repositório antes de qualquer operação Git.
2.  **Contexto**: O ID do Jira deve ser obtido do prompt do usuário ou do contexto da tarefa atual.
3.  **Segurança**: Nunca commite arquivos de configuração local (`.env`, `docker-compose.override.yml`, etc.).

---
> [!IMPORTANT]
> Siga sempre os SOPs definidos no `GEMINI.md`.
