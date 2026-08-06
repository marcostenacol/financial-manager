import { inject, injectable } from 'tsyringe';
import { Person, ProfileScope } from '@prisma/client';
import { PersonRepositoryInterface } from '../repositories/contracts/PersonRepositoryInterface';

@injectable()
export class ListPeopleService {
  constructor(
    @inject('PersonRepository') private personRepository: PersonRepositoryInterface,
  ) {}

  async execute(userId: string, scope?: ProfileScope, organizationIds: string[] = []): Promise<Person[]> {
    return this.personRepository.findAllByOwner(userId, organizationIds, scope);
  }
}
