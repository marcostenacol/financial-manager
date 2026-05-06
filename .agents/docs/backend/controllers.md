# Controllers — Fastify

## Papel

O Controller é a camada HTTP do módulo. Ele:

1. Recebe o `FastifyRequest` e `FastifyReply`.
2. Valida o input com o Zod DTO correspondente.
3. Delega ao Service injetado.
4. Formata e retorna a resposta via `Response.ts`.

**Nunca** contém regra de negócio, acesso ao banco ou lógica de cache.

---

## BaseController

```typescript
// src/base/http/BaseController.ts
import { FastifyReply } from 'fastify';
import { ResponseTrait } from '@/base/traits/Response';

export abstract class BaseController {
  protected response = new ResponseTrait();

  protected success(
    reply: FastifyReply,
    data: unknown,
    message = 'Operação realizada com sucesso',
    status_code = 200,
  ): void {
    reply.status(status_code).send(this.response.success(data, message));
  }

  protected error(
    reply: FastifyReply,
    message: string,
    status_code = 400,
  ): void {
    reply.status(status_code).send(this.response.error(message));
  }
}
```

---

## Padrão de Controller de Módulo

```typescript
// src/modules/wallet/controllers/WalletController.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateWalletService } from '../services/CreateWalletService';
import { ListWalletsService } from '../services/ListWalletsService';
import { CreateWalletDTO } from '../dtos/CreateWalletDTO';

@injectable()
export class WalletController extends BaseController {
  constructor(
    @inject('CreateWalletService') private create_wallet_service: CreateWalletService,
    @inject('ListWalletsService') private list_wallets_service: ListWalletsService,
  ) {
    super();
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = CreateWalletDTO.parse(request.body);
    const wallet = await this.create_wallet_service.execute({
      ...dto,
      user_id: request.user.id,
    });
    return this.success(reply, wallet, 'Carteira criada com sucesso', 201);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const wallets = await this.list_wallets_service.execute({
      user_id: request.user.id,
    });
    return this.success(reply, wallets);
  }
}
```

---

## Tratamento de Erros no Controller

O Controller **não** usa try/catch para erros de negócio — o `ErrorHandler.ts` captura globalmente os `AppError`. Exceções de Zod (validação de DTO) são capturadas pelo handler global também.

```typescript
// Se precisar de lógica condicional simples:
async detail(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
  const { id } = request.params;
  const wallet = await this.detail_wallet_service.execute({ wallet_id: id, user_id: request.user.id });
  return this.success(reply, wallet);
}
```

---

## Acesso ao Usuário Autenticado

O `AuthMiddleware` adiciona o usuário decodificado ao request:

```typescript
// Em qualquer controller com rota protegida:
const user_id = request.user.id;
const user_role = request.user.role;
```

---

## Regras

- Um Controller por módulo (concentra todos os handlers do módulo).
- Métodos nomeados pela ação: `create`, `list`, `detail`, `update`, `destroy`, `transfer`.
- Toda validação de input via Zod DTO — nunca validação manual no controller.
- Resposta sempre via `this.success()` ou `this.error()` herdados do `BaseController`.
- Status codes:
  - `200` → listagem, detalhe, atualização
  - `201` → criação
  - `204` → deleção sem body
  - `400` → erro de negócio
  - `401` → não autenticado
  - `403` → não autorizado
  - `404` → não encontrado
  - `422` → erro de validação DTO
  - `500` → erro interno
