import { injectable, inject } from 'tsyringe';
import { Wallet, Prisma } from '@prisma/client';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';
import { WalletRepositoryInterface } from '../repositories/contracts/WalletRepositoryInterface';
import { UpdateWalletDTOType } from '../dtos/UpdateWalletDTO';
import { assertOwnership } from '@/shared/authorization/ownership';
import { resolveOwnerKey } from '@/shared/lib/resolveOwnerKey';

type UpdateWalletServiceInput = UpdateWalletDTOType & { id: string; user_id: string; organization_ids?: string[] };

@injectable()
export class UpdateWalletService {
  constructor(
    @inject('WalletRepository')
    private wallet_repository: WalletRepositoryInterface,
    @inject('CacheTrait')
    private cache: CacheTrait,
  ) {}

  async execute({ id, user_id, organization_ids = [], ...data }: UpdateWalletServiceInput): Promise<Wallet> {
    const wallet = await this.wallet_repository.findById(id);

    assertOwnership(wallet, user_id, organization_ids, 'Carteira não encontrada');

    const update_payload: Prisma.WalletUncheckedUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.scope !== undefined && { scope: data.scope }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.balance !== undefined && { balance: new Prisma.Decimal(data.balance) }),
    };

    const updated_wallet = await this.wallet_repository.update(id, update_payload);

    // Invalida cache
    if (wallet!.organizationId) {
      await this.cache.delPattern(CacheKeys.wallets.listAllPattern());
    } else {
      await this.cache.delPattern(CacheKeys.wallets.listPattern(resolveOwnerKey(wallet!)));
    }
    await this.cache.del(CacheKeys.wallets.detail(id));
    await this.cache.delPattern(CacheKeys.reports.overviewPattern(user_id));

    return updated_wallet;
  }
}
