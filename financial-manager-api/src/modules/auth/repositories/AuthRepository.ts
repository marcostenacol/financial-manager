import { injectable } from 'tsyringe';
import { User, Role, RefreshToken } from '@prisma/client';
import { prisma } from '@/shared/database/PrismaClient';
import { AuthRepositoryInterface } from './contracts/AuthRepositoryInterface';
import { RegisterDTOType } from '../dtos/RegisterDTO';

@injectable()
export class AuthRepository implements AuthRepositoryInterface {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true, profile: true },
    });
  }

  async create(data: RegisterDTOType, role_id: string): Promise<User> {
    return prisma.user.create({
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
    return prisma.role.findUnique({
      where: { slug },
    });
  }

  async createRefreshToken(user_id: string, token: string, expires_at: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId: user_id,
        token,
        expiresAt: expires_at,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllUserRefreshTokens(user_id: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId: user_id },
    });
  }
}
