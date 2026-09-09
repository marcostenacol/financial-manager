import { injectable, inject } from 'tsyringe';
import { hash } from 'bcrypt';
import { User } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { AuthRepositoryInterface } from '../repositories/contracts/AuthRepositoryInterface';
import { RegisterDTOType } from '../dtos/RegisterDTO';
import { RoleEnum } from '../enums/RoleEnum';

@injectable()
export class RegisterService {
  constructor(
    @inject('AuthRepository')
    private auth_repository: AuthRepositoryInterface,
  ) {}

  async execute(data: RegisterDTOType): Promise<Omit<User, 'password'>> {
    const user_exists = await this.auth_repository.findByEmail(data.email);

    if (user_exists) {
      throw new AppError('Não foi possível concluir o cadastro', 400);
    }

    const role = await this.auth_repository.findRoleBySlug(RoleEnum.USER);

    if (!role) {
      throw new AppError('Role padrão não encontrada', 500);
    }

    const hashed_password = await hash(data.password, 10);

    const user = await this.auth_repository.create(
      {
        ...data,
        password: hashed_password,
      },
      role.id,
    );

    const { password: _password, ...user_without_password } = user;

    return user_without_password;
  }
}
