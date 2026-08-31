import { inject, injectable } from 'tsyringe';
import { Wallet } from '@prisma/client';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { WalletTypeEnum } from '@/modules/wallets/enums/WalletTypeEnum';

@injectable()
export class ListCreditCardsService {
  constructor(
    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,
  ) {}

  async execute(userId: string, organizationIds: string[] = []): Promise<Wallet[]> {
    const wallets = await this.walletRepository.findAllByOwner(userId, organizationIds);
    return wallets.filter((wallet) => wallet.type === WalletTypeEnum.CREDIT);
  }
}
