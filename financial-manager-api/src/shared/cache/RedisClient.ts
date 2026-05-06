import { createClient, RedisClientType } from 'redis';

let client: RedisClientType;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    client.on('error', (err) => console.error('Redis Client Error', err));
    
    await client.connect();
  }
  return client;
}
