import { injectable, inject } from 'tsyringe';
import { Wallet, Prisma } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { UpdateWalletDTOType } from '../dtos/UpdateWalletDTO';

type UpdateWalletServiceInput = UpdateWalletDTOType & { id: string; user_id: string };

@injectable()
export class UpdateWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute({ id, user_id, ...data }: UpdateWalletServiceInput): Promise<Wallet> {
    const wallet = await this.wallet_repository.findById(id);

    if (!wallet || wallet.userId !== user_id) {
      throw new AppError('Carteira não encontrada', 404);
    }

    const update_payload: Prisma.WalletUncheckedUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.scope !== undefined && { scope: data.scope }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.balance !== undefined && { balance: new Prisma.Decimal(data.balance) }),
    };

    const updated_wallet = await this.wallet_repository.update(id, update_payload);

    // Invalida cache
    await this.cache.delPattern(CacheKeys.wallets.listPattern(user_id));
    await this.cache.del(CacheKeys.wallets.detail(id));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(user_id));

    return updated_wallet;
  }
}
