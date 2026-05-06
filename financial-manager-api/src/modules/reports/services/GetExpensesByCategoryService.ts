import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface, ExpenseByCategoryData } from '../repositories/contracts/ReportRepositoryInterface';
import { CacheTrait } from '@/base/traits/CacheTrait';

@injectable()
export class GetExpensesByCategoryService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  async execute(userId: string, month: number, year: number): Promise<ExpenseByCategoryData[]> {
    const cacheKey = `reports:expenses-category:${userId}:${month}:${year}`;
    
    const cached = await this.cache.get<ExpenseByCategoryData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.reportRepository.getExpensesByCategory(userId, month, year);

    await this.cache.set(cacheKey, data, 600); // 10 minutos

    return data;
  }
}
