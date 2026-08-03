import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { RedeemInviteService } from '../services/RedeemInviteService';

@injectable()
export class InviteController extends BaseController {
  constructor(
    @inject('RedeemInviteService') private redeemInvite: RedeemInviteService,
  ) {
    super();
  }

  async redeem(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { code } = request.params as { code: string };
    const membership = await this.redeemInvite.execute(code, request.user.sub);
    return this.success(reply, membership, 'Convite aceito com sucesso');
  }
}
