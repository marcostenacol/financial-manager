import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { AuthController } from './controllers/AuthController';
import { authMiddleware } from '@/shared/middlewares/AuthMiddleware';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(AuthController);

  fastify.post('/register', controller.register.bind(controller));
  fastify.post('/login', controller.login.bind(controller));
  fastify.post('/refresh', controller.refresh.bind(controller));
  
  fastify.post('/logout', { preHandler: [authMiddleware] }, controller.logout.bind(controller));
}
