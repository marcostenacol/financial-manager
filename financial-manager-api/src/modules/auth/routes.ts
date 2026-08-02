import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { AuthController } from './controllers/AuthController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(AuthController);

  const bruteForceRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

  fastify.post('/register', bruteForceRateLimit, controller.register.bind(controller));
  fastify.post('/login', bruteForceRateLimit, controller.login.bind(controller));
  fastify.post('/refresh', controller.refresh.bind(controller));
  
  fastify.post('/logout', { preHandler: [authMiddleware] }, controller.logout.bind(controller));
}
