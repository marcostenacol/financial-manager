import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateWalletService } from '../services/CreateWalletService';
import { ListWalletsService } from '../services/ListWalletsService';
import { UpdateWalletService } from '../services/UpdateWalletService';
import { DeleteWalletService } from '../services/DeleteWalletService';

@injectable()
export class WalletController extends BaseController {
  constructor(
    @inject('CreateWalletService') private create_wallet: CreateWalletService,
    @inject('ListWalletsService') private list_wallets: ListWalletsService,
    @inject('UpdateWalletService') private update_wallet: UpdateWalletService,
    @inject('DeleteWalletService') private delete_wallet: DeleteWalletService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const wallets = await this.list_wallets.execute((request.user as any).sub);
    return this.success(reply, wallets);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as any;
    const wallet = await this.create_wallet.execute({
      user_id: (request.user as any).sub,
      ...data,
    });
    return this.success(reply, wallet, 'Carteira criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const wallet = await this.update_wallet.execute({
      id,
      user_id: (request.user as any).sub,
      ...data,
    });
    return this.success(reply, wallet, 'Carteira atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await this.delete_wallet.execute(id, (request.user as any).sub);
    return this.success(reply, null, 'Carteira deletada com sucesso');
  }
}
