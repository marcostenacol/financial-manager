import { Recurrence, Prisma } from '@prisma/client';

export interface RecurrenceRepositoryInterface {
  create(data: Prisma.RecurrenceUncheckedCreateInput): Promise<Recurrence>;
  update(id: string, data: Prisma.RecurrenceUncheckedUpdateInput): Promise<Recurrence>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Recurrence | null>;
  findByUserId(userId: string): Promise<Recurrence[]>;
  findAllActive(): Promise<Recurrence[]>;
  findActiveByUserId(userId: string): Promise<Recurrence[]>;
}
