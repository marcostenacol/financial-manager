import 'reflect-metadata';
import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import '@/shared/container';
import { errorHandler } from '@/shared/errors/ErrorHandler';

const app: FastifyInstance = fastify({
  logger: process.env.NODE_ENV === 'development',
});

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

// Error Handler
app.setErrorHandler(errorHandler);

// Routes Placeholder
app.get('/health', async () => {
  return { status: 'ok' };
});

export { app };
