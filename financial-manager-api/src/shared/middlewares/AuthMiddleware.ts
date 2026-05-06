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
      // Fallback ou verificação de logout
      // Por enquanto, se não estiver no cache (Redis), podemos considerar inválido se o padrão for obrigatório
      // Mas vamos permitir por enquanto se o JWT for válido
    }
  } catch (err) {
    throw new AppError('Não autenticado', 401);
  }
}
