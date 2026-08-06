import { inject, injectable } from 'tsyringe';
import { Person } from '@prisma/client';
import { PersonRepositoryInterface } from '../repositories/contracts/PersonRepositoryInterface';
import { UpdatePersonDTOType } from '../dtos/UpdatePersonDTO';
import { assertOwnership } from '@/shared/authorization/ownership';

@injectable()
export class UpdatePersonService {
  constructor(
    @inject('PersonRepository') private personRepository: PersonRepositoryInterface,
  ) {}

  async execute(id: string, data: UpdatePersonDTOType, userId: string, organizationIds: string[] = []): Promise<Person> {
    const person = await this.personRepository.findById(id);
    assertOwnership(person, userId, organizationIds, 'Pessoa não encontrada');

    return this.personRepository.update(id, {
      name: data.name,
      theyOweMe: data.they_owe_me,
      iOweThem: data.i_owe_them,
      paymentFrequency: data.payment_frequency,
      pixKey: data.pix_key,
      pixKeyType: data.pix_key_type,
      pixCity: data.pix_city,
      notes: data.notes,
    });
  }
}
