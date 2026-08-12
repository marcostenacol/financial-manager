import { createClient, RedisClientType } from 'redis';

let client: RedisClientType;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
      },
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();
  }
  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
  }
}
