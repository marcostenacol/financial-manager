import { Person, Prisma, ProfileScope } from '@prisma/client';
import { PersonRepositoryInterface } from './contracts/PersonRepositoryInterface';
import { prisma } from '@/shared/database/PrismaClient';
import { injectable } from 'tsyringe';

@injectable()
export class PersonRepository implements PersonRepositoryInterface {
  async create(data: Prisma.PersonUncheckedCreateInput): Promise<Person> {
    return prisma.person.create({ data });
  }

  async findById(id: string): Promise<Person | null> {
    return prisma.person.findUnique({ where: { id } });
  }

  async findAllByOwner(userId: string, organizationIds: string[], scope?: ProfileScope): Promise<Person[]> {
    const ownershipFilter: Prisma.PersonWhereInput = {
      OR: [
        { userId, organizationId: null },
        ...(organizationIds.length > 0 ? [{ organizationId: { in: organizationIds } }] : []),
      ],
    };

    const scopeFilter: Prisma.PersonWhereInput | undefined = scope ? { scope } : undefined;

    return prisma.person.findMany({
      where: {
        AND: [ownershipFilter, ...(scopeFilter ? [scopeFilter] : [])],
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: Prisma.PersonUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Person> {
    const client = tx ?? prisma;
    return client.person.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.person.delete({ where: { id } });
  }
}
