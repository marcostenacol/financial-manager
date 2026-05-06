import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { CreateRecurrenceDTOType } from '../dtos/CreateRecurrenceDTO';
import { WalletRepositoryInterface } from '@/modules/wallets/repositories/contracts/WalletRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class CreateRecurrenceService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    @inject('WalletRepository')
    private walletRepository: WalletRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(data: CreateRecurrenceDTOType, userId: string): Promise<Recurrence> {
    const wallet = await this.walletRepository.findById(data.wallet_id);

    if (!wallet || wallet.userId !== userId) {
      throw new AppError('Carteira não encontrada ou acesso negado', 403);
    }

    const recurrence = await this.recurrenceRepository.create({
      description: data.description,
      amount: data.amount,
      type: data.type,
      walletId: data.wallet_id,
      categoryId: data.category_id,
      period: data.period,
      startsAt: new Date(data.starts_at),
      endsAt: data.ends_at ? new Date(data.ends_at) : undefined,
    });

    await this.cache.del(`recurrences:user:${userId}`);

    return recurrence;
  }
}
