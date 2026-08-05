import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { TransferOwnershipService } from '@/modules/organizations/services/TransferOwnershipService';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('TransferOwnershipService', () => {
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let service: TransferOwnershipService;

  beforeEach(() => {
    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
      update: vi.fn(),
    } as any;

    service = new TransferOwnershipService(organizationMemberRepository);
  });

  it('should transfer ownership to a target member and demote the current owner', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser')
      .mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any)
      .mockResolvedValueOnce({ id: 'target-membership', role: 'member' } as any);
    vi.spyOn(organizationMemberRepository, 'update').mockResolvedValueOnce({ id: 'target-membership', role: 'owner' } as any);

    const result = await service.execute('org-1', 'target-user', 'owner-user');

    expect(result).toHaveProperty('role', 'owner');
    expect(organizationMemberRepository.update).toHaveBeenCalledWith('target-membership', { role: 'owner' }, expect.anything());
    expect(organizationMemberRepository.update).toHaveBeenCalledWith('owner-membership', { role: 'member' }, expect.anything());
  });

  it('should reject when the requester is not the owner', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValueOnce({ id: 'm1', role: 'member' } as any);

    await expect(service.execute('org-1', 'target-user', 'requester')).rejects.toThrow(
      'Apenas o dono da organização pode transferir a titularidade',
    );
  });

  it('should reject transferring ownership to oneself', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any);

    await expect(service.execute('org-1', 'owner-user', 'owner-user')).rejects.toThrow('Você já é o dono desta organização');
  });

  it('should reject when the target is not a member of the organization', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser')
      .mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any)
      .mockResolvedValueOnce(null);

    await expect(service.execute('org-1', 'non-member', 'owner-user')).rejects.toThrow(AppError);
  });
});
