import 'reflect-metadata';
import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

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

// Error Handler
app.setErrorHandler(errorHandler);

// Routes
import { authRoutes } from '@/modules/auth/routes';
import { profileRoutes } from '@/modules/profile/routes';

app.register(authRoutes, { prefix: '/api/v1/auth' });
app.register(profileRoutes, { prefix: '/api/v1/profile' });

// Health Check
app.get('/health', async () => {
  return { status: 'ok' };
});

export { app };
