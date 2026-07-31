import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { RegisterService } from '../services/RegisterService';
import { LoginService } from '../services/LoginService';
import { RefreshTokenService } from '../services/RefreshTokenService';
import { LogoutService } from '../services/LogoutService';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { LoginDTO } from '../dtos/LoginDTO';

@injectable()
export class AuthController extends BaseController {
  constructor(
    @inject('RegisterService') private register_service: RegisterService,
    @inject('LoginService') private login_service: LoginService,
    @inject('RefreshTokenService') private refresh_token_service: RefreshTokenService,
    @inject('LogoutService') private logout_service: LogoutService,
  ) {
    super();
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = RegisterDTO.parse(request.body);
    const user = await this.register_service.execute(dto);
    return this.success(reply, user, 'Usuário cadastrado com sucesso', 201);
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = LoginDTO.parse(request.body);
    const result = await this.login_service.execute(dto);
    return this.success(reply, result, 'Login realizado com sucesso');
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { refresh_token } = request.body as { refresh_token: string };
    const result = await this.refresh_token_service.execute(refresh_token);
    return this.success(reply, result);
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.logout_service.execute(request.user.sub);
    return this.success(reply, null, 'Logout realizado com sucesso');
  }
}
