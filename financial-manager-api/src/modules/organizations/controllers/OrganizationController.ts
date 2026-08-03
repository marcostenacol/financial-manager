import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateOrganizationService } from '../services/CreateOrganizationService';
import { ListMyOrganizationsService } from '../services/ListMyOrganizationsService';
import { ListMembersService } from '../services/ListMembersService';
import { RemoveMemberService } from '../services/RemoveMemberService';
import { CreateInviteService } from '../services/CreateInviteService';
import { ListInvitesService } from '../services/ListInvitesService';
import { RevokeInviteService } from '../services/RevokeInviteService';
import { ListInviteRedemptionsService } from '../services/ListInviteRedemptionsService';
import { CreateOrganizationDTO } from '../dtos/CreateOrganizationDTO';
import { CreateInviteDTO } from '../dtos/CreateInviteDTO';

@injectable()
export class OrganizationController extends BaseController {
  constructor(
    @inject('CreateOrganizationService') private createOrganization: CreateOrganizationService,
    @inject('ListMyOrganizationsService') private listMyOrganizations: ListMyOrganizationsService,
    @inject('ListMembersService') private listMembers: ListMembersService,
    @inject('RemoveMemberService') private removeMember: RemoveMemberService,
    @inject('CreateInviteService') private createInvite: CreateInviteService,
    @inject('ListInvitesService') private listInvites: ListInvitesService,
    @inject('RevokeInviteService') private revokeInvite: RevokeInviteService,
    @inject('ListInviteRedemptionsService') private listInviteRedemptions: ListInviteRedemptionsService,
  ) {
    super();
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateOrganizationDTO.parse(request.body);
    const organization = await this.createOrganization.execute(data, request.user.sub);
    return this.success(reply, organization, 'Organização criada com sucesso', 201);
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const organizations = await this.listMyOrganizations.execute(request.user.sub);
    return this.success(reply, organizations);
  }

  async members(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const members = await this.listMembers.execute(id, request.user.sub);
    return this.success(reply, members);
  }

  async removeMemberHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id, userId } = request.params as { id: string; userId: string };
    await this.removeMember.execute(id, userId, request.user.sub);
    return this.success(reply, null, 'Membro removido com sucesso');
  }

  async storeInvite(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = CreateInviteDTO.parse(request.body);
    const invite = await this.createInvite.execute(id, data, request.user.sub);
    return this.success(reply, invite, 'Convite criado com sucesso', 201);
  }

  async indexInvites(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const invites = await this.listInvites.execute(id, request.user.sub);
    return this.success(reply, invites);
  }

  async revokeInviteHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id, inviteId } = request.params as { id: string; inviteId: string };
    const invite = await this.revokeInvite.execute(id, inviteId, request.user.sub);
    return this.success(reply, invite, 'Convite revogado com sucesso');
  }

  async inviteRedemptions(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id, inviteId } = request.params as { id: string; inviteId: string };
    const redemptions = await this.listInviteRedemptions.execute(id, inviteId, request.user.sub);
    return this.success(reply, redemptions);
  }
}
