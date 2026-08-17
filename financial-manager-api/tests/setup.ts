import 'reflect-metadata';

process.env.JWT_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d';
process.env.JWT_SECRET ??= 'test-secret';
process.env.DATABASE_URL ??= 'postgresql://user:password@localhost:5432/test_db?schema=public';
process.env.REDIS_URL ??= 'redis://localhost:6379';
