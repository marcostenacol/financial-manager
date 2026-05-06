# Cache — Redis com CacheTrait

## Papel

O cache Redis é **obrigatório** em todas as listagens e detalhes. Nunca bata direto no banco em endpoints de leitura frequente.

---

## RedisClient

```typescript
// src/shared/cache/RedisClient.ts
import { createClient, RedisClientType } from 'redis';

let client: RedisClientType;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    await client.connect();
  }
  return client;
}
```

---

## CacheTrait

```typescript
// src/base/traits/CacheTrait.ts
import { injectable } from 'tsyringe';
import { getRedisClient } from '@/shared/cache/RedisClient';

@injectable()
export class CacheTrait {
  async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttl_seconds = 300): Promise<void> {
    const client = await getRedisClient();
    await client.setEx(key, ttl_seconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    const client = await getRedisClient();
    await client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
}
```

---

## Padrões de Chave de Cache

| Recurso | Chave | TTL |
|---------|-------|-----|
| Token de auth | `auth:token:{user_id}` | Igual ao JWT |
| Perfil do usuário | `profile:user:{user_id}` | 300s |
| Carteiras do usuário | `wallets:user:{user_id}` | 300s |
| Detalhe de carteira | `wallet:{wallet_id}` | 300s |
| Transações de carteira | `transactions:wallet:{wallet_id}:page:{page}` | 60s |
| Categorias do sistema | `categories:system` | 3600s |
| Categorias do usuário | `categories:user:{user_id}` | 300s |
| Resumo de saldo | `report:balance:{user_id}` | 60s |
| Gastos por categoria | `report:expenses_by_category:{user_id}:{month}` | 60s |
| Evolução mensal | `report:monthly_evolution:{user_id}:{year}` | 60s |

---

## Padrão de Uso no Service

```typescript
// ListWalletsService.ts
async execute({ user_id }: { user_id: string }): Promise<Wallet[]> {
  const cache_key = `wallets:user:${user_id}`;

  // 1. Verificar cache
  const cached = await this.cache.get<Wallet[]>(cache_key);
  if (cached) return cached;

  // 2. Buscar no banco
  const wallets = await this.wallet_repository.findAllByUser(user_id);

  // 3. Salvar no cache
  await this.cache.set(cache_key, wallets, 300);

  return wallets;
}
```

---

## Invalidação de Cache

Sempre invalidar ao criar, atualizar ou deletar:

```typescript
// CreateWalletService.ts
const wallet = await this.wallet_repository.create(data);

// Invalida listagem (o novo item não está no cache)
await this.cache.del(`wallets:user:${user_id}`);
```

Para padrões (ex: todas as páginas de transações de uma carteira):

```typescript
// DeleteTransactionService.ts
await this.cache.delPattern(`transactions:wallet:${wallet_id}:*`);
```

---

## Auth Token no Redis

```typescript
// LoginService.ts — ao gerar o token
await this.cache.set(
  `auth:token:${user.id}`,
  { user_id: user.id, role: user.role },
  jwt_ttl_seconds,
);

// LogoutService.ts — ao invalidar
await this.cache.del(`auth:token:${user.id}`);
```

```typescript
// AuthMiddleware.ts — ao validar
const cached_user = await cache.get(`auth:token:${decoded.user_id}`);
if (!cached_user) {
  // fallback: busca no banco
}
```

---

## Regras

- Toda listagem **obrigatoriamente** usa cache antes de ir ao banco.
- Toda operação de escrita (create/update/delete) **obrigatoriamente** invalida o cache relacionado.
- TTL de relatórios: 60s (dados frequentemente consultados, mas aceitam leve desatualização).
- TTL de listagens: 300s (5 minutos).
- TTL de categorias do sistema: 3600s (raramente mudam).
- TTL de token: igual ao `exp` do JWT.
- Usar `delPattern` para invalidar múltiplas páginas paginadas.
- Nunca cachear dados sensíveis como senhas ou tokens completos.
