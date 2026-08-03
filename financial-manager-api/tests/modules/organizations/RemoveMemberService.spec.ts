import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoveMemberService } from '@/modules/organizations/services/RemoveMemberService';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';

describe('RemoveMemberService', () => {
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let service: RemoveMemberService;

  beforeEach(() => {
    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
      countOwners: vi.fn(),
      delete: vi.fn(),
    } as any;

    service = new RemoveMemberService(organizationMemberRepository);
  });

  it('should let the owner remove a regular member', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser')
      .mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any)
      .mockResolvedValueOnce({ id: 'target-membership', role: 'member' } as any);

    await service.execute('org-1', 'target-user', 'owner-user');

    expect(organizationMemberRepository.delete).toHaveBeenCalledWith('target-membership');
  });

  it('should reject when the requester is not the owner', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValueOnce({ id: 'm1', role: 'member' } as any);

    await expect(service.execute('org-1', 'target-user', 'requester-user')).rejects.toThrow(
      'Apenas o dono da organização pode remover membros',
    );
    expect(organizationMemberRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject removing the last owner of the organization', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser')
      .mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any)
      .mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any);
    vi.spyOn(organizationMemberRepository, 'countOwners').mockResolvedValue(1);

    await expect(service.execute('org-1', 'owner-user', 'owner-user')).rejects.toThrow(
      'A organização precisa de pelo menos um dono',
    );
    expect(organizationMemberRepository.delete).not.toHaveBeenCalled();
  });

  it('should allow removing an owner when there are other owners left', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser')
      .mockResolvedValueOnce({ id: 'owner-membership-1', role: 'owner' } as any)
      .mockResolvedValueOnce({ id: 'owner-membership-2', role: 'owner' } as any);
    vi.spyOn(organizationMemberRepository, 'countOwners').mockResolvedValue(2);

    await service.execute('org-1', 'other-owner', 'owner-user');

    expect(organizationMemberRepository.delete).toHaveBeenCalledWith('owner-membership-2');
  });

  it('should reject when the target is not a member', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser')
      .mockResolvedValueOnce({ id: 'owner-membership', role: 'owner' } as any)
      .mockResolvedValueOnce(null);

    await expect(service.execute('org-1', 'non-member', 'owner-user')).rejects.toThrow(AppError);
  });
});
