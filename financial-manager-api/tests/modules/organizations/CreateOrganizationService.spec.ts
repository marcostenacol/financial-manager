import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { CreateOrganizationService } from '@/modules/organizations/services/CreateOrganizationService';
import { OrganizationRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';

describe('CreateOrganizationService', () => {
  let organizationRepository: OrganizationRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let service: CreateOrganizationService;

  beforeEach(() => {
    organizationRepository = {
      create: vi.fn(),
    } as any;

    organizationMemberRepository = {
      create: vi.fn(),
    } as any;

    service = new CreateOrganizationService(organizationRepository, organizationMemberRepository);
  });

  it('should create the organization and make the creator its owner', async () => {
    vi.spyOn(organizationRepository, 'create').mockResolvedValue({ id: 'org-1', name: 'Padaria do João' } as any);

    const result = await service.execute({ name: 'Padaria do João' }, 'user-1');

    expect(result).toHaveProperty('id', 'org-1');
    expect(organizationMemberRepository.create).toHaveBeenCalledWith(
      { organizationId: 'org-1', userId: 'user-1', role: 'owner' },
      expect.anything(),
    );
  });
});
