import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { DeleteInviteService } from '@/modules/organizations/services/DeleteInviteService';
import { InviteRepositoryInterface } from '@/modules/organizations/repositories/contracts/InviteRepositoryInterface';
import { InviteRedemptionRepositoryInterface } from '@/modules/organizations/repositories/contracts/InviteRedemptionRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('DeleteInviteService', () => {
  let inviteRepository: InviteRepositoryInterface;
  let inviteRedemptionRepository: InviteRedemptionRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let service: DeleteInviteService;

  beforeEach(() => {
    inviteRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
    } as any;

    inviteRedemptionRepository = {
      deleteAllByInviteId: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
    } as any;

    service = new DeleteInviteService(inviteRepository, inviteRedemptionRepository, organizationMemberRepository);
  });

  it('should delete an invite and its redemptions', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', role: 'owner' } as any);
    vi.spyOn(inviteRepository, 'findById').mockResolvedValue({ id: 'invite-1', organizationId: 'org-1' } as any);

    await service.execute('org-1', 'invite-1', 'owner-user');

    expect(inviteRedemptionRepository.deleteAllByInviteId).toHaveBeenCalledWith('invite-1', expect.anything());
    expect(inviteRepository.delete).toHaveBeenCalledWith('invite-1', expect.anything());
  });

  it('should reject when the requester is not the owner', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', role: 'member' } as any);

    await expect(service.execute('org-1', 'invite-1', 'user-1')).rejects.toThrow(
      'Apenas o dono da organização pode excluir convites',
    );
    expect(inviteRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when the invite does not belong to the organization', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', role: 'owner' } as any);
    vi.spyOn(inviteRepository, 'findById').mockResolvedValue({ id: 'invite-1', organizationId: 'org-2' } as any);

    await expect(service.execute('org-1', 'invite-1', 'owner-user')).rejects.toThrow(AppError);
  });
});
