import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '@/shared/errors/AppError';

export function permissionMiddleware(roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user as { role: string };

    if (!user || !roles.includes(user.role)) {
      throw new AppError('Acesso negado: Permissão insuficiente', 403);
    }
  };
}
