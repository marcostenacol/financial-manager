import { injectable, inject } from 'tsyringe';
import { Prisma } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { assertOwnership } from '@/shared/authorization/ownership';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

@injectable()
export class DeleteWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute(id: string, user_id: string, organization_ids: string[] = []): Promise<void> {
    const wallet = await this.wallet_repository.findById(id);

    assertOwnership(wallet, user_id, organization_ids, 'Carteira não encontrada');

    try {
      await this.wallet_repository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Não é possível excluir uma carteira com transações ou recorrências vinculadas', 409);
      }
      throw error;
    }

    // Invalida cache
    if (wallet!.organizationId) {
      await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.wallets.listPattern(resolveOwnerKey(wallet!)));
    }
    await this.cache.del(CacheKeys.wallets.detail(id));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(user_id));
  }
}
