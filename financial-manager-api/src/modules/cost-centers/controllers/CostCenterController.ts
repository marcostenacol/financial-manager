import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateCostCenterService } from '../services/CreateCostCenterService';
import { ListCostCentersService } from '../services/ListCostCentersService';
import { UpdateCostCenterService } from '../services/UpdateCostCenterService';
import { DeleteCostCenterService } from '../services/DeleteCostCenterService';
import { CreateCostCenterDTO } from '../dtos/CreateCostCenterDTO';
import { UpdateCostCenterDTO } from '../dtos/UpdateCostCenterDTO';

@injectable()
export class CostCenterController extends BaseController {
  constructor(
    @inject('CreateCostCenterService') private createCostCenter: CreateCostCenterService,
    @inject('ListCostCentersService') private listCostCenters: ListCostCentersService,
    @inject('UpdateCostCenterService') private updateCostCenter: UpdateCostCenterService,
    @inject('DeleteCostCenterService') private deleteCostCenter: DeleteCostCenterService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const costCenters = await this.listCostCenters.execute(request.user.sub, request.organizationIds);
    return this.success(reply, costCenters);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateCostCenterDTO.parse(request.body);
    const costCenter = await this.createCostCenter.execute(data, request.user.sub);
    return this.success(reply, costCenter, 'Centro de custo criado com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = UpdateCostCenterDTO.parse(request.body);
    const costCenter = await this.updateCostCenter.execute(id, data, request.user.sub, request.organizationIds);
    return this.success(reply, costCenter, 'Centro de custo atualizado com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await this.deleteCostCenter.execute(id, request.user.sub, request.organizationIds);
    return this.success(reply, null, 'Centro de custo removido com sucesso');
  }
}
