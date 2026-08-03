import { CostCenter, Prisma } from '@prisma/client';

export interface CostCenterRepositoryInterface {
  create(data: Prisma.CostCenterUncheckedCreateInput): Promise<CostCenter>;
  update(id: string, data: Prisma.CostCenterUncheckedUpdateInput): Promise<CostCenter>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<CostCenter | null>;
  findAllByUserId(userId: string): Promise<CostCenter[]>;
}
