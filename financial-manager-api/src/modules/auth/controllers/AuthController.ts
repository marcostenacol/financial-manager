import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { RegisterService } from '../services/RegisterService';
import { LoginService } from '../services/LoginService';
import { RegisterDTO } from '../dtos/RegisterDTO';
import { LoginDTO } from '../dtos/LoginDTO';

@injectable()
export class AuthController extends BaseController {
  constructor(
    @inject('RegisterService') private register_service: RegisterService,
    @inject('LoginService') private login_service: LoginService,
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
}
