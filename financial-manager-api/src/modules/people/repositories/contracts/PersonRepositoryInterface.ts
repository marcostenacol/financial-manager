import { Person, Prisma, ProfileScope } from '@prisma/client';

export interface PersonRepositoryInterface {
  create(data: Prisma.PersonUncheckedCreateInput): Promise<Person>;
  findById(id: string): Promise<Person | null>;
  findAllByOwner(userId: string, organizationIds: string[], scope?: ProfileScope): Promise<Person[]>;
  update(id: string, data: Prisma.PersonUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Person>;
  delete(id: string): Promise<void>;
}
