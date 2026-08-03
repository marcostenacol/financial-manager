import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { ProfileScope } from '@prisma/client';
import { BaseController } from '@/base/http/BaseController';
import { CreateWalletService } from '../services/CreateWalletService';
import { ListWalletsService } from '../services/ListWalletsService';
import { UpdateWalletService } from '../services/UpdateWalletService';
import { DeleteWalletService } from '../services/DeleteWalletService';
import { DetailWalletService } from '../services/DetailWalletService';
import { SetPrimaryWalletService } from '../services/SetPrimaryWalletService';
import { ClearAllWalletsService } from '../services/ClearAllWalletsService';
import { MoveWalletToOrganizationService } from '../services/MoveWalletToOrganizationService';
import { CreateWalletDTO } from '../dtos/CreateWalletDTO';
import { UpdateWalletDTO } from '../dtos/UpdateWalletDTO';
import { MoveWalletToOrganizationDTO } from '../dtos/MoveWalletToOrganizationDTO';

@injectable()
export class WalletController extends BaseController {
  constructor(
    @inject('CreateWalletService') private create_wallet: CreateWalletService,
    @inject('ListWalletsService') private list_wallets: ListWalletsService,
    @inject('UpdateWalletService') private update_wallet: UpdateWalletService,
    @inject('DeleteWalletService') private delete_wallet: DeleteWalletService,
    @inject('DetailWalletService') private detail_wallet: DetailWalletService,
    @inject('SetPrimaryWalletService') private set_primary_wallet: SetPrimaryWalletService,
    @inject('ClearAllWalletsService') private clear_all_wallets: ClearAllWalletsService,
    @inject('MoveWalletToOrganizationService') private move_wallet_to_organization: MoveWalletToOrganizationService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { scope } = request.query as { scope?: ProfileScope };
    const wallets = await this.list_wallets.execute(request.user.sub, scope, request.organizationIds);
    return this.success(reply, wallets);
  }

  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const wallet = await this.detail_wallet.execute(id, request.user.sub, request.organizationIds);
    return this.success(reply, wallet);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateWalletDTO.parse(request.body);
    const wallet = await this.create_wallet.execute({
      user_id: request.user.sub,
      ...data,
    });
    return this.success(reply, wallet, 'Carteira criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = UpdateWalletDTO.parse(request.body);
    const wallet = await this.update_wallet.execute({
      id,
      user_id: request.user.sub,
      organization_ids: request.organizationIds,
      ...data,
    });
    return this.success(reply, wallet, 'Carteira atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await this.delete_wallet.execute(id, request.user.sub, request.organizationIds);
    return this.success(reply, null, 'Carteira deletada com sucesso');
  }

  async setPrimary(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const wallet = await this.set_primary_wallet.execute(id, request.user.sub);
    return this.success(reply, wallet, 'Carteira principal definida com sucesso');
  }

  async moveToOrganization(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const { organization_id } = MoveWalletToOrganizationDTO.parse(request.body);
    const wallet = await this.move_wallet_to_organization.execute(id, organization_id, request.user.sub);
    return this.success(reply, wallet, 'Carteira movida para a organização com sucesso');
  }

  async clearAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.clear_all_wallets.execute(request.user.sub);
    return this.success(reply, null, 'Carteiras removidas com sucesso');
  }
}
