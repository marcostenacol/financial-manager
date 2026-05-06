import 'reflect-metadata';
import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';

import { container } from 'tsyringe';

import '@/shared/container';
import { errorHandler } from '@/shared/errors/ErrorHandler';

const app: FastifyInstance = fastify({
  logger: process.env.NODE_ENV === 'development',
});

container.registerInstance<FastifyInstance>('Fastify', app);

// Plugins
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'secret',
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Financial Manager API',
      description: 'API para gerenciamento financeiro pessoal e empresarial',
      version: '1.0.0',
    },
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(multipart);

app.register(fastifyStatic, {
  root: path.resolve(__dirname, '..', 'tmp', 'uploads'),
  prefix: '/uploads/',
});

// Error Handler
app.setErrorHandler(errorHandler);

// Routes
import { authRoutes } from '@/modules/auth/routes';
import { profileRoutes } from '@/modules/profile/routes';
import { walletRoutes } from '@/modules/wallets/routes';
import { transactionRoutes } from '@/modules/transactions/routes';
import { categoryRoutes } from '@/modules/categories/routes';

app.register(authRoutes, { prefix: '/api/v1/auth' });
app.register(profileRoutes, { prefix: '/api/v1/profile' });
app.register(walletRoutes, { prefix: '/api/v1/wallets' });
app.register(transactionRoutes, { prefix: '/api/v1/transactions' });
app.register(categoryRoutes, { prefix: '/api/v1/categories' });

// Health Check
app.get('/health', async () => {
  return { status: 'ok' };
});

export { app };
