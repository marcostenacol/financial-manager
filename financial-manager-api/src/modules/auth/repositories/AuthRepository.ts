import { injectable } from 'tsyringe';
import { User, Role } from '@prisma/client';
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
}
