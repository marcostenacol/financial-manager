import 'reflect-metadata';
import 'dotenv/config';
import '@/shared/config/env';
import fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';

import { container } from 'tsyringe';

import '@/shared/container';
import { errorHandler } from '@/shared/errors/ErrorHandler';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado — defina a variável de ambiente antes de iniciar a aplicação.');
}

const app: FastifyInstance = fastify({
  logger: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  },
});

container.registerInstance<FastifyInstance>('Fastify', app);

// Plugins
app.register(fastifyHelmet, {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

app.register(fastifyCors, {
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
    : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
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

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

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
import { recurrenceRoutes } from '@/modules/recurrences/routes';
import { reportRoutes } from '@/modules/reports/routes';
import { savingsGoalRoutes } from '@/modules/savings-goals/routes';
import { notificationRoutes } from '@/modules/notifications/routes';
import { costCenterRoutes } from '@/modules/cost-centers/routes';
import { organizationRoutes } from '@/modules/organizations/routes';
import { personRoutes } from '@/modules/people/routes';

app.register(authRoutes, { prefix: '/api/v1/auth' });
app.register(profileRoutes, { prefix: '/api/v1/profile' });
app.register(walletRoutes, { prefix: '/api/v1/wallets' });
app.register(transactionRoutes, { prefix: '/api/v1/transactions' });
app.register(categoryRoutes, { prefix: '/api/v1/categories' });
app.register(recurrenceRoutes, { prefix: '/api/v1/recurrences' });
app.register(reportRoutes, { prefix: '/api/v1/reports' });
app.register(savingsGoalRoutes, { prefix: '/api/v1/savings-goals' });
app.register(notificationRoutes, { prefix: '/api/v1/notifications' });
app.register(costCenterRoutes, { prefix: '/api/v1/cost-centers' });
app.register(organizationRoutes, { prefix: '/api/v1/organizations' });
app.register(personRoutes, { prefix: '/api/v1/people' });

// Health Check
app.get('/health', async () => {
  return { status: 'ok' };
});

export { app };
