import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do Prisma antes dos imports que o utilizam
vi.mock('@/shared/database/PrismaClient', () => ({
  prisma: {
    $transaction: vi.fn((callback) => callback({})),
  },
}));

import { ClearAllWalletsService } from '@/modules/wallets/services/ClearAllWalletsService';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { RecurrenceRepositoryInterface } from '@/modules/recurrences/repositories/contracts/RecurrenceRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

describe('ClearAllWalletsService', () => {
  let walletRepository: WalletRepositoryInterface;
  let transactionRepository: TransactionRepositoryInterface;
  let recurrenceRepository: RecurrenceRepositoryInterface;
  let organizationMemberRepository: OrganizationMemberRepositoryInterface;
  let cacheTrait: CacheTrait;
  let clearAllWalletsService: ClearAllWalletsService;

  beforeEach(() => {
    walletRepository = {
      findAllByUserId: vi.fn().mockResolvedValue([{ id: 'wallet-1' }]),
      deleteAllByUserId: vi.fn(),
      findAllByOrganizationId: vi.fn().mockResolvedValue([]),
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    transactionRepository = {
      deleteAllByUserId: vi.fn(),
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    recurrenceRepository = {
      deleteAllByUserId: vi.fn(),
      deleteAllByOrganizationId: vi.fn(),
    } as any;

    organizationMemberRepository = {
      findByOrganizationAndUser: vi.fn().mockResolvedValue({ id: 'member-1' }),
    } as any;

    cacheTrait = {
      del: vi.fn(),
      delPattern: vi.fn(),
    } as any;

    clearAllWalletsService = new ClearAllWalletsService(
      walletRepository,
      transactionRepository,
      recurrenceRepository,
      organizationMemberRepository,
      cacheTrait,
    );
  });

  it('should delete transactions and recurrences before the wallets themselves (FK order)', async () => {
    await clearAllWalletsService.execute('user-1');

    expect(transactionRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
    expect(recurrenceRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
    expect(walletRepository.deleteAllByUserId).toHaveBeenCalledWith('user-1', expect.anything());
  });

  it('should target only the organization data when organizationId is given, never the personal data', async () => {
    await clearAllWalletsService.execute('user-1', 'org-1');

    expect(transactionRepository.deleteAllByOrganizationId).toHaveBeenCalledWith('org-1', expect.anything());
    expect(recurrenceRepository.deleteAllByOrganizationId).toHaveBeenCalledWith('org-1', expect.anything());
    expect(walletRepository.deleteAllByOrganizationId).toHaveBeenCalledWith('org-1', expect.anything());
    expect(transactionRepository.deleteAllByUserId).not.toHaveBeenCalled();
    expect(recurrenceRepository.deleteAllByUserId).not.toHaveBeenCalled();
    expect(walletRepository.deleteAllByUserId).not.toHaveBeenCalled();
  });

  it('should refuse to clear an organization the user does not belong to', async () => {
    (organizationMemberRepository.findByOrganizationAndUser as any).mockResolvedValue(null);

    await expect(clearAllWalletsService.execute('user-1', 'org-2')).rejects.toThrow(
      'Você não faz parte desta organização',
    );
    expect(walletRepository.deleteAllByOrganizationId).not.toHaveBeenCalled();
  });
});
