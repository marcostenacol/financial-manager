import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { DeleteOrganizationService } from '@/modules/organizations/services/DeleteOrganizationService';
import { OrganizationRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { InviteRepositoryInterface } from '@/modules/organizations/repositories/contracts/InviteRepositoryInterface';
import { InviteRedemptionRepositoryInterface } from '@/modules/organizations/repositories/contracts/InviteRedemptionRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('DeleteOrganizationService', () => {
  let organizationRepository: OrganizationRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let inviteRepository: InviteRepositoryInterface;
  let inviteRedemptionRepository: InviteRedemptionRepositoryInterface;
  let service: DeleteOrganizationService;

  beforeEach(() => {
    organizationRepository = {
      countLinkedRecords: vi.fn(),
      delete: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    inviteRepository = {
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    inviteRedemptionRepository = {
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    service = new DeleteOrganizationService(organizationRepository, organizationMemberRepository, inviteRepository, inviteRedemptionRepository);
  });

  it('should delete an organization with no linked records', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', role: 'owner' } as any);
    vi.spyOn(organizationRepository, 'countLinkedRecords').mockResolvedValue(0);

    await service.execute('org-1', 'owner-user');

    expect(organizationRepository.delete).toHaveBeenCalledWith('org-1', expect.anything());
  });

  it('should reject when the requester is not the owner', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', role: 'member' } as any);

    await expect(service.execute('org-1', 'user-1')).rejects.toThrow('Apenas o dono da organização pode excluí-la');
    expect(organizationRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when the organization still has linked records', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', role: 'owner' } as any);
    vi.spyOn(organizationRepository, 'countLinkedRecords').mockResolvedValue(3);

    await expect(service.execute('org-1', 'owner-user')).rejects.toThrow(AppError);
    expect(organizationRepository.delete).not.toHaveBeenCalled();
  });
});
