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
