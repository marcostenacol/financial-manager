import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, MonthlyEvolutionData } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class GetMonthlyEvolutionService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string): Promise<MonthlyEvolutionData[]> {
    const cacheKey = `reports:monthly-evolution:${userId}`;
    
    const cached = await this.cache.get<MonthlyEvolutionData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getMonthlyEvolution(userId);

    await this.cache.set(cacheKey, data, 1800); // 30 minutos

    return data;
  }
}
