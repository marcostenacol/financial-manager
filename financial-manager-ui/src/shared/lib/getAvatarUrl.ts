const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1';

export function getAvatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  return `${new URL(API_URL).origin}/uploads/${avatar}`;
}
