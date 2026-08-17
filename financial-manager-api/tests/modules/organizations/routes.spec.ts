import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildTestApp, signAuthToken } from '../../helpers/testApp';
import { AppError } from '@/shared/errors/AppError';

// O Controller resolve estes Services uma única vez, na primeira execução do plugin de rota
// (boot do Fastify) — mockar via `vi.mock()` do módulo (hoisted) garante que o Controller já
// nasce com o mock, independente de quando o boot ocorre em relação ao container do tsyringe.
const createOrganizationExecute = vi.fn();
const listMyOrganizationsExecute = vi.fn();
const removeMemberExecute = vi.fn();

vi.mock('@/modules/organizations/services/CreateOrganizationService', () => ({
  CreateOrganizationService: vi.fn().mockImplementation(function () { return { execute: createOrganizationExecute }; }),
}));

vi.mock('@/modules/organizations/services/ListMyOrganizationsService', () => ({
  ListMyOrganizationsService: vi.fn().mockImplementation(function () { return { execute: listMyOrganizationsExecute }; }),
}));

vi.mock('@/modules/organizations/services/RemoveMemberService', () => ({
  RemoveMemberService: vi.fn().mockImplementation(function () { return { execute: removeMemberExecute }; }),
}));

describe('Organizations routes (HTTP layer)', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildTestApp();
    token = await signAuthToken(app);
  });

  beforeEach(() => {
    createOrganizationExecute.mockReset();
    listMyOrganizationsExecute.mockReset();
    removeMemberExecute.mockReset();
  });

  it('cria uma organização com sucesso (POST /)', async () => {
    const createdOrganization = { id: 'organization-1', name: 'Minha Empresa' };
    createOrganizationExecute.mockResolvedValue(createdOrganization);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'Minha Empresa' },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(createdOrganization);
  });

  it('lista as organizações do usuário com sucesso (GET /)', async () => {
    const organizations = [{ id: 'organization-1', name: 'Minha Empresa', role: 'OWNER' }];
    listMyOrganizationsExecute.mockResolvedValue(organizations);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(organizations);
  });

  it('retorna 422 ao criar organização com payload inválido', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/organizations',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'A' },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().success).toBe(false);
    expect(createOrganizationExecute).not.toHaveBeenCalled();
  });

  it('retorna 403 ao remover membro sem ser dono da organização', async () => {
    removeMemberExecute.mockRejectedValue(new AppError('Apenas o dono da organização pode remover membros', 403));

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/organizations/organization-1/members/user-2',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toBe('Apenas o dono da organização pode remover membros');
  });

  it('retorna 401 ao chamar sem token de autenticação', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/organizations',
    });

    expect(response.statusCode).toBe(401);
  });
});
