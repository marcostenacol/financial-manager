import { User, Role, RefreshToken } from '@prisma/client';
import { RegisterDTOType } from '../../dtos/RegisterDTO';

export interface AuthRepositoryInterface {
  findByEmail(email: string): Promise<User | null>;
  create(data: RegisterDTOType, role_id: string): Promise<User>;
  findRoleBySlug(slug: string): Promise<Role | null>;
  createRefreshToken(user_id: string, token: string, expires_at: Date): Promise<RefreshToken>;
  findRefreshToken(token: string): Promise<RefreshToken | null>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteAllUserRefreshTokens(user_id: string): Promise<void>;
}
