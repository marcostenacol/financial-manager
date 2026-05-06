import { injectable } from 'tsyringe';
import { User, Role, RefreshToken } from '@prisma/client';
import { BaseRepository } from '@/base/repository/BaseRepository';
import { AuthRepositoryInterface } from './contracts/AuthRepositoryInterface';
import { RegisterDTOType } from '../dtos/RegisterDTO';

@injectable()
export class AuthRepository extends BaseRepository implements AuthRepositoryInterface {
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async create(data: RegisterDTOType, role_id: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        roleId: role_id,
        profile: {
          create: {
            name: data.name,
            type: data.type,
          },
        },
      },
    });
  }

  async findRoleBySlug(slug: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { slug },
    });
  }

  async createRefreshToken(user_id: string, token: string, expires_at: Date): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        userId: user_id,
        token,
        expiresAt: expires_at,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllUserRefreshTokens(user_id: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user_id },
    });
  }
}
