import { inject, injectable } from 'tsyringe';
import { prisma } from '@/shared/database/PrismaClient';
import { RecurrenceRepositoryInterface } from '../repositories/contracts/RecurrenceRepositoryInterface';
import { TransactionRepositoryInterface } from '@/modules/transactions/repositories/contracts/TransactionRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { AppError } from '@/shared/errors/AppError';
import { CacheTrait } from '@/base/traits/CacheTrait';
import { CacheKeys } from '@/shared/cache/CacheKeys';

@injectable()
export class ClearAllRecurrencesService {
  constructor(
    @inject('RecurrenceRepository')
    private recurrenceRepository: RecurrenceRepositoryInterface,

    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,

    @inject('OrganizationMemberRepository')
    private organizationMemberRepository: OrganizationMemberRepositoryInterface,

    private cache: CacheTrait,
  ) {}

  /**
   * `organizationId` decide o alvo real da limpeza — sem isso, "Zerar tudo" clicado na aba
   * Empresarial acabava apagando as recorrências PESSOAIS do usuário (o service sempre operou
   * por `userId`, ignorando por completo o escopo ativo na tela).
   */
  async execute(userId: string, organizationId?: string): Promise<void> {
    if (organizationId) {
      const membership = await this.organizationMemberRepository.findByOrganizationAndUser(organizationId, userId);
      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }

      await prisma.$transaction(async (tx) => {
        // Desvincula as transações já geradas em vez de apagá-las — cancelar
        // recorrências não deve destruir o histórico de lançamentos.
        await this.transactionRepository.nullifyRecurrenceForOrganization(organizationId, tx);
        await this.recurrenceRepository.deleteAllByOrganizationId(organizationId, tx);
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await this.transactionRepository.nullifyRecurrenceForUser(userId, tx);
      await this.recurrenceRepository.deleteAllByUserId(userId, tx);
    });

    await this.cache.del(CacheKeys.recurrences.list(userId));
  }
}
