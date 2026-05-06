import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { AuthController } from './controllers/AuthController';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const controller = container.resolve(AuthController);

  fastify.post('/register', controller.register.bind(controller));
  fastify.post('/login', controller.login.bind(controller));
}
