import { inject, injectable } from 'tsyringe';
import { Person } from '@prisma/client';
import { PersonRepositoryInterface } from '../repositories/contracts/PersonRepositoryInterface';
import { OrganizationMemberRepositoryInterface } from '@/modules/organizations/repositories/contracts/OrganizationMemberRepositoryInterface';
import { CreatePersonDTOType } from '../dtos/CreatePersonDTO';
import { AppError } from '@/shared/errors/AppError';

@injectable()
export class CreatePersonService {
  constructor(
    @inject('PersonRepository') private personRepository: PersonRepositoryInterface,
    @inject('OrganizationMemberRepository') private organizationMemberRepository: OrganizationMemberRepositoryInterface,
  ) {}

  async execute(data: CreatePersonDTOType, userId: string): Promise<Person> {
    if (data.organization_id) {
      const membership = await this.organizationMemberRepository.findByOrganizationAndUser(data.organization_id, userId);

      if (!membership) {
        throw new AppError('Você não faz parte desta organização', 403);
      }
    }

    // `scope` nunca deve divergir de `organization_id` — mesma regra já aplicada em wallets/categories.
    return this.personRepository.create({
      userId: data.organization_id ? null : userId,
      organizationId: data.organization_id ?? null,
      scope: data.organization_id ? 'business' : (data.scope ?? 'personal'),
      name: data.name,
      theyOweMe: data.they_owe_me ?? 0,
      iOweThem: data.i_owe_them ?? 0,
      paymentFrequency: data.payment_frequency ?? 'ONE_TIME',
      pixKey: data.pix_key,
      pixKeyType: data.pix_key_type,
      pixCity: data.pix_city,
      notes: data.notes,
    });
  }
}
