import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from 'tsyringe';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { AppError } from '@/shared/errors/AppError';

export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
    
    const { sub: user_id } = request.user as { sub: string };
    
    const cache = container.resolve<CacheTrait>(CacheTrait);
    const cached_user = await cache.get(`auth:token:${user_id}`);

    if (!cached_user) {
      // Sessão não encontrada no Redis: token foi revogado (logout) ou expirou no cache.
      throw new AppError('Sessão inválida ou expirada', 401);
    }
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('Não autenticado', 401);
  }
}
