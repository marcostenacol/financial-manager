# Git workflow

## Repositório

Um único Git na raiz (`financial-manager/`), remoto `git@github.com:marcostenacol/financial-manager.git`. `financial-manager-api/` e `financial-manager-ui/` são apenas pastas dentro dele, não repositórios/submódulos próprios — não há `.git` dentro de cada subpasta.

## Mensagem de commit — padrão real observado

```
[TASK-16] feat(savings-goals): implementando módulo de metas de economia completo (CRUD + Dashboard)
[TASK-12] test(api): implementando testes unitários para wallets, transactions e categories
[SECURITY] fix(api): correções de segurança e qualidade
```

- Prefixo `[TASK-NN]` (não `AE3-`/`EB-`/`GIZ-` como em outros projetos AE3) — numeração sequencial simples, sem rastreador externo (Jira) aparente.
- Existe também um prefixo `[SECURITY]` fora do padrão `[TASK-NN]`, usado uma vez para um commit de correção de segurança/qualidade — trate como categoria válida quando a mudança for justamente esse tipo de correção.
- Tipo convencional (`feat`/`fix`/`test`/`docs`/`chore`) + escopo entre parênteses indicando módulo e às vezes a camada (`feat(savings-goals)`, `feat(ui/wallets)`, `feat(api/transactions)`) — o escopo mistura módulo de negócio com `api`/`ui` quando é preciso desambiguar de qual subpasta se trata.
- Mensagem descritiva em português, na maioria dos casos no gerúndio ("implementando", "adicionando", "finalizando").

## Branch

Não há branches locais além da atual para confirmar o padrão real de nome — `.agents/GEMINI.md` sugere `TASK-{ID}-descrição` (ex.: `TASK-001-autenticacao-jwt`). Use esse padrão até que o usuário informe outro, mas trate como não confirmado pelo `git log` (diferente do padrão de commit, que é 100% confirmado pelo histórico real).

## Pull Request

`.agents/GEMINI.md` recomenda `gh pr create --fill` — não há PR real neste histórico para confirmar um template de descrição (diferente do projeto de referência GIZ, que tem PRs reais documentados). Ao abrir um PR, pergunte ao usuário se há um template preferido em vez de assumir uma estrutura de seções.

## Regra geral

Só crie commit quando pedido explicitamente. Nunca se coloque como co-autor no commit.
