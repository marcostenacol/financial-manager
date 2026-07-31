import { inject, injectable } from 'tsyringe';
import { Recurrence } from '@prisma/client';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ListRecurrencesService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<Recurrence[]> {
    const cacheKey = CacheKeys.recurrences.list(userId);
    
    const cached = await this.cache.get<Recurrence[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const recurrences = await this.recurrenceRepository.findByUserId(userId);

    await this.cache.set(cacheKey, recurrences);

    return recurrences;
  }
}
