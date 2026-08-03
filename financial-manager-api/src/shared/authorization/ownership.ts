import { AppError } from '@/shared/errors/AppError';

export interface OwnableRecord {
  userId?: string | null;
  organizationId?: string | null;
}

export function isOwnedByActor(record: OwnableRecord, userId: string, organizationIds: string[]): boolean {
  if (record.organizationId) {
    return organizationIds.includes(record.organizationId);
  }
  return record.userId === userId;
}

export function assertOwnership(
  record: OwnableRecord | null,
  userId: string,
  organizationIds: string[],
  message = 'Recurso não encontrado',
): void {
  if (!record || !isOwnedByActor(record, userId, organizationIds)) {
    throw new AppError(message, 404);
  }
}
