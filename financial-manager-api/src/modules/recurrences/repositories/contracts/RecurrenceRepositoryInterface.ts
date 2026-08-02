import { Recurrence, Prisma } from '@prisma/client';

export type RecurrenceWithRelations = Prisma.RecurrenceGetPayload<{
  include: { wallet: true; category: true };
}>;

export interface RecurrenceRepositoryInterface {
  create(data: Prisma.RecurrenceUncheckedCreateInput): Promise<Recurrence>;
  update(id: string, data: Prisma.RecurrenceUncheckedUpdateInput, tx?: Prisma.TransactionClient): Promise<Recurrence>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<RecurrenceWithRelations | null>;
  findByUserId(userId: string): Promise<Recurrence[]>;
  findAllActive(): Promise<Recurrence[]>;
  findActiveByUserId(userId: string): Promise<Recurrence[]>;
  deleteAllByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<void>;
}
