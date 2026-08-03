import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { RedeemInviteService } from '@/modules/organizations/services/RedeemInviteService';
import { InviteRepositoryInterface } from '@/modules/organizations/repositories/contracts/InviteRepositoryInterface';
import { InviteRedemptionRepositoryInterface } from '@/modules/organizations/repositories/contracts/InviteRedemptionRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('RedeemInviteService', () => {
  let inviteRepository: InviteRepositoryInterface;
  let inviteRedemptionRepository: InviteRedemptionRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let service: RedeemInviteService;

  const baseInvite = {
    id: 'invite-1',
    organizationId: 'org-1',
    code: 'ABCD-1234',
    role: 'member' as const,
    maxUses: null as number | null,
    usesCount: 0,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    revokedAt: null as Date | null,
    createdBy: 'owner-1',
  };

  beforeEach(() => {
    inviteRepository = {
      findByCode: vi.fn(),
      update: vi.fn(),
    } as any;

    inviteRedemptionRepository = {
      create: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
      create: vi.fn(),
    } as any;

    service = new RedeemInviteService(inviteRepository, inviteRedemptionRepository, organizationMemberRepository);
  });

  it('should redeem a valid invite and create a membership', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue(baseInvite as any);
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(null);
    vi.spyOn(organizationMemberRepository, 'create').mockResolvedValue({ id: 'member-1', organizationId: 'org-1', userId: 'user-1', role: 'member' } as any);

    const result = await service.execute('ABCD-1234', 'user-1');

    expect(result).toHaveProperty('id', 'member-1');
    expect(inviteRepository.update).toHaveBeenCalledWith('invite-1', { usesCount: { increment: 1 } }, expect.anything());
  });

  it('should reject an invite code that does not exist', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue(null);

    await expect(service.execute('BAD-CODE', 'user-1')).rejects.toThrow(AppError);
  });

  it('should reject a revoked invite', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue({ ...baseInvite, revokedAt: new Date() } as any);

    await expect(service.execute('ABCD-1234', 'user-1')).rejects.toThrow('Convite inválido ou expirado');
  });

  it('should reject an expired invite', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue({ ...baseInvite, expiresAt: new Date(Date.now() - 1000) } as any);

    await expect(service.execute('ABCD-1234', 'user-1')).rejects.toThrow('Convite inválido ou expirado');
  });

  it('should reject a single-use invite that was already used', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue({ ...baseInvite, usesCount: 1 } as any);

    await expect(service.execute('ABCD-1234', 'user-1')).rejects.toThrow('Convite inválido ou expirado');
  });

  it('should reject a multi-use invite that reached its limit', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue({ ...baseInvite, maxUses: 3, usesCount: 3 } as any);

    await expect(service.execute('ABCD-1234', 'user-1')).rejects.toThrow('Convite inválido ou expirado');
  });

  it('should allow a multi-use invite still under its limit', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue({ ...baseInvite, maxUses: 3, usesCount: 1 } as any);
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(null);
    vi.spyOn(organizationMemberRepository, 'create').mockResolvedValue({ id: 'member-2' } as any);

    await expect(service.execute('ABCD-1234', 'user-1')).resolves.toHaveProperty('id', 'member-2');
  });

  it('should reject when the user is already a member of the organization', async () => {
    vi.spyOn(inviteRepository, 'findByCode').mockResolvedValue(baseInvite as any);
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'existing-membership' } as any);

    await expect(service.execute('ABCD-1234', 'user-1')).rejects.toThrow('Você já faz parte desta organização');
  });
});
