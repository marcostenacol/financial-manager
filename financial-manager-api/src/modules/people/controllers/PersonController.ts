import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { ProfileScope } from '@prisma/client';
import { BaseController } from '@/base/http/BaseController';
import { CreatePersonService } from '../services/CreatePersonService';
import { ListPeopleService } from '../services/ListPeopleService';
import { UpdatePersonService } from '../services/UpdatePersonService';
import { DeletePersonService } from '../services/DeletePersonService';
import { SettlePersonDebtService } from '../services/SettlePersonDebtService';
import { GetPersonPixQrCodeService } from '../services/GetPersonPixQrCodeService';
import { CreatePersonDTO } from '../dtos/CreatePersonDTO';
import { UpdatePersonDTO } from '../dtos/UpdatePersonDTO';
import { SettlePersonDebtDTO } from '../dtos/SettlePersonDebtDTO';

@injectable()
export class PersonController extends BaseController {
  constructor(
    @inject('CreatePersonService') private createPerson: CreatePersonService,
    @inject('ListPeopleService') private listPeople: ListPeopleService,
    @inject('UpdatePersonService') private updatePerson: UpdatePersonService,
    @inject('DeletePersonService') private deletePerson: DeletePersonService,
    @inject('SettlePersonDebtService') private settlePersonDebt: SettlePersonDebtService,
    @inject('GetPersonPixQrCodeService') private getPersonPixQrCode: GetPersonPixQrCodeService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { scope } = request.query as { scope?: ProfileScope };
    const people = await this.listPeople.execute(userId, scope, request.organizationIds);
    return this.success(reply, people);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreatePersonDTO.parse(request.body);
    const userId = request.user.sub;
    const person = await this.createPerson.execute(data, userId);
    return this.success(reply, person, 'Pessoa cadastrada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = UpdatePersonDTO.parse(request.body);
    const userId = request.user.sub;
    const person = await this.updatePerson.execute(id, data, userId, request.organizationIds);
    return this.success(reply, person, 'Pessoa atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    await this.deletePerson.execute(id, userId, request.organizationIds);
    return this.success(reply, null, 'Pessoa removida com sucesso');
  }

  async settleDebt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = SettlePersonDebtDTO.parse(request.body);
    const userId = request.user.sub;
    const result = await this.settlePersonDebt.execute(id, data, userId, request.organizationIds);
    return this.success(reply, result, 'Pagamento registrado com sucesso', 201);
  }

  async pixQrCode(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const qrCode = await this.getPersonPixQrCode.execute(id, userId, request.organizationIds);
    return this.success(reply, qrCode);
  }
}
