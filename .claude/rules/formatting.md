# Formatação de código

## API (`financial-manager-api/`)

Não há Prettier nem ESLint configurado no `package.json` da API — não existe um comando de lint/format dedicado hoje. O único guia de estilo automatizado é o `tsconfig.json` (`strict: true`), verificado via `npm run build` (`tsc`).

Antes de considerar uma mudança na API concluída:

```bash
cd financial-manager-api
npm run build   # tsc — falha se houver erro de tipo
```

Se o usuário instalar Prettier/ESLint no futuro, atualize esta seção com o comando real — não presuma que existe um hoje.

## UI (`financial-manager-ui/`)

Há ESLint configurado (`eslint.config.js`, flat config: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`). Não há Prettier configurado (`postcss.config.js`/`tailwind.config.js` existem, mas não há `.prettierrc`).

Antes de considerar uma mudança na UI concluída:

```bash
cd financial-manager-ui
npm run lint    # eslint .
```

## Geral

Nenhum dos dois subprojetos roda em container Docker de desenvolvimento local por padrão (o `docker-compose.yml` de cada subpasta é voltado a `homolog`/produção, com perfis — ver `rules/project-tech.md`) — comandos de lint/build/test rodam direto no host via `npm`, diferente do projeto de referência GIZ (que roda tudo em container). Não introduza `docker compose exec` para rodar lint/teste aqui a menos que o usuário peça.
