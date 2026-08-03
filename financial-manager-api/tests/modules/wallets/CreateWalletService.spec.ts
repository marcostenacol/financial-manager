import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateWalletService } from '@/modules/wallets/services/CreateWalletService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('CreateWalletService', () => {
  let walletRepository: WalletRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let cacheTrait: CacheTrait;
  let createWalletService: CreateWalletService;

  beforeEach(() => {
    walletRepository = {
      create: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn(),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    createWalletService = new CreateWalletService(walletRepository, organizationMemberRepository, cacheTrait);
  });

  it('should create a new wallet and clear cache', async () => {
    const walletData = {
      name: 'Main Wallet',
      type: 'personal',
      balance: 100,
    };
    const userId = 'user-id';

    vi.spyOn(walletRepository, 'create').mockResolvedValue({
      id: 'wallet-id',
      userId,
      ...walletData,
    } as any);

    const result = await createWalletService.execute({ ...walletData, user_id: userId } as any);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(walletData.name);
    expect(cacheTrait.delPattern).toHaveBeenCalledWith(`wallets:user:${userId}:*`);
  });

  it('should create a wallet for an organization when the user is a member', async () => {
    const userId = 'user-id';
    const organizationId = 'org-1';

    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue({ id: 'm1', organizationId, userId, role: 'owner' } as any);
    vi.spyOn(walletRepository, 'create').mockResolvedValue({ id: 'wallet-id', organizationId } as any);

    await createWalletService.execute({ name: 'Empresa', type: 'checking', balance: 0, user_id: userId, organization_id: organizationId } as any);

    expect(walletRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: null, organizationId }));
    expect(cacheTrait.delPattern).toHaveBeenCalledWith('wallets:user:*');
  });

  it('should reject creating an organization wallet when the user is not a member', async () => {
    vi.spyOn(organizationMemberRepository, 'findByOrganizationAndUser').mockResolvedValue(null);

    await expect(
      createWalletService.execute({ name: 'Empresa', type: 'checking', balance: 0, user_id: 'user-id', organization_id: 'org-1' } as any),
    ).rejects.toThrow('Você não faz parte desta organização');
    expect(walletRepository.create).not.toHaveBeenCalled();
  });
});
