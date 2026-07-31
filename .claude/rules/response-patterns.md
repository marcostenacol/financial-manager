# Padrões de resposta (API)

## Envelope padrão

Toda resposta de sucesso e erro segue `{ success, message, data }`, montado por `ResponseTrait` (`src/base/traits/Response.ts`) e usado através de `BaseController.success()`/`BaseController.error()`:

```typescript
// sucesso
this.success(reply, transaction, 'Transação criada com sucesso', 201);
// → { success: true, message: 'Transação criada com sucesso', data: transaction }

// erro "manual" a partir do Controller (raro — a maioria dos erros sobe via AppError/ErrorHandler)
this.error(reply, 'Mensagem de erro', 400);
// → { success: false, message: 'Mensagem de erro' }  (sem chave `data`)
```

- `message` tem default `'Operação realizada com sucesso'` em `success()` — só passe uma mensagem explícita quando quiser algo mais específico (o que é o padrão real: todo `store`/`update`/`delete` de domínio passa uma mensagem própria).
- `status_code` tem default `200` em `success()` e `400` em `error()` — passe explicitamente `201` em criação (`store`), como já é feito em todo Controller de domínio.

## Erros de negócio — sempre via `AppError` + `ErrorHandler`

```typescript
throw new AppError('Carteira não encontrada', 404);
```

`ErrorHandler.ts` (registrado como `app.setErrorHandler(errorHandler)` em `app.ts`) intercepta globalmente:

| Exceção | Tratamento |
|---------|-----------|
| `AppError` | `{ success: false, message: error.message, data: null }` com `status_code` do próprio erro |
| `ZodError` | 422, `{ success: false, message: 'Erro de validação', data: error.flatten().fieldErrors }` |
| Qualquer outra | `console.error(error)` + 500 genérico, `{ success: false, message: 'Erro interno do servidor', data: null }` |

Não existe tratamento dedicado para outros tipos de erro (ex.: erro do Prisma por violação de constraint única) — cai no branch genérico de 500 hoje. Se precisar de um 409/422 mais específico para erro de banco, é preciso adicionar um `if` novo em `ErrorHandler.ts` (mudança na trait, não algo a contornar Controller a Controller).

## Listagem — sem paginação estruturada hoje

Diferente do projeto de referência GIZ (que usa `Resource::collection()` com paginação automática), aqui os `List{Entidade}Service` retornam o array completo do Prisma direto, sem wrapper de paginação (`meta`/`links`) — `this.success(reply, transactions)` envia o array cru dentro de `data`. Se uma listagem precisar de paginação de verdade, isso é uma decisão de design a propor (ex.: `take`/`skip` do Prisma + `meta.total`), não algo já resolvido para copiar de outro módulo.
