import { FastifyReply } from 'fastify';
import { ResponseTrait } from '@/base/traits/Response';

export abstract class BaseController {
  protected response = new ResponseTrait();

  protected success(
    reply: FastifyReply,
    data: unknown,
    message = 'Operação realizada com sucesso',
    status_code = 200,
  ): void {
    reply.status(status_code).send(this.response.success(data, message));
  }

  protected error(
    reply: FastifyReply,
    message: string,
    status_code = 400,
  ): void {
    reply.status(status_code).send(this.response.error(message));
  }
}
