interface OwnableRecord {
  userId?: string | null;
  organizationId?: string | null;
}

export function resolveOwnerKey(record: OwnableRecord): string {
  return record.userId ?? `org:${record.organizationId}`;
}
