import { container } from 'tsyringe';
import { FastifyInstance } from 'fastify';
import { CacheTrait } from '@/base/traits/CacheTrait';

/**
 * Monta a app Fastify real para teste de rota (app.inject()), substituindo no container
 * as dependências que tocam infraestrutura compartilhada de produção (Redis/Postgres reais,
 * ver .claude/CLAUDE.md > "supertest foi removido") antes do boot dos plugins de rota.
 * Services específicos do endpoint sob teste continuam sendo sobrescritos no próprio spec.
 */
export async function buildTestApp(): Promise<FastifyInstance> {
  const { app } = await import('@/app');

  container.registerInstance<CacheTrait>(CacheTrait, {
    get: async () => ({ mocked: true }),
    set: async () => undefined,
    del: async () => undefined,
    delPattern: async () => undefined,
  } as unknown as CacheTrait);

  container.registerInstance('OrganizationMemberRepository', {
    findOrganizationIdsByUserId: async (): Promise<string[]> => [],
  });

  return app;
}

export async function signAuthToken(app: FastifyInstance, sub = 'user-1'): Promise<string> {
  await app.ready();
  return app.jwt.sign({ sub, role: 'user' });
}
