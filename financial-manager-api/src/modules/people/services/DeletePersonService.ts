import { inject, injectable } from 'tsyringe';
import { PersonRepositoryInterface } from '../repositories/contracts/PersonRepositoryInterface';
import { assertOwnership } from '@/shared/authorization/ownership';

@injectable()
export class DeletePersonService {
  constructor(
    @inject('PersonRepository') private personRepository: PersonRepositoryInterface,
  ) {}

  async execute(id: string, userId: string, organizationIds: string[] = []): Promise<void> {
    const person = await this.personRepository.findById(id);
    assertOwnership(person, userId, organizationIds, 'Pessoa não encontrada');

    await this.personRepository.delete(id);
  }
}
