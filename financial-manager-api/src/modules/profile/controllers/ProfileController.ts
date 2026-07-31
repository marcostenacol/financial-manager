import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { AppError } from '@/shared/errors/AppError';
import { DetailProfileService } from '../services/DetailProfileService';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);
import { UpdateProfileService } from '../services/UpdateProfileService';
import { ChangeProfileTypeService } from '../services/ChangeProfileTypeService';
import { UpdateAvatarService } from '../services/UpdateAvatarService';
import { UpdateProfileDTO } from '../dtos/UpdateProfileDTO';
import { ChangeProfileTypeDTO } from '../dtos/ChangeProfileTypeDTO';

@injectable()
export class ProfileController extends BaseController {
  constructor(
    @inject('DetailProfileService') private detail_profile: DetailProfileService,
    @inject('UpdateProfileService') private update_profile: UpdateProfileService,
    @inject('ChangeProfileTypeService') private change_type: ChangeProfileTypeService,
    @inject('UpdateAvatarService') private update_avatar: UpdateAvatarService,
  ) {
    super();
  }

  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const profile = await this.detail_profile.execute(request.user.sub);
    return this.success(reply, profile);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = UpdateProfileDTO.parse(request.body);
    const profile = await this.update_profile.execute({
      user_id: request.user.sub,
      ...data,
    });
    return this.success(reply, profile, 'Perfil atualizado com sucesso');
  }

  async changeType(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { type } = ChangeProfileTypeDTO.parse(request.body);
    const profile = await this.change_type.execute(request.user.sub, type);
    return this.success(reply, profile, 'Tipo de perfil alterado com sucesso');
  }

  async avatar(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = await request.file();
    if (!data) {
      throw new AppError('Arquivo não enviado', 400);
    }

    const userId = request.user.sub;
    const existingProfile = await this.detail_profile.execute(userId);
    const extension = path.extname(data.filename);
    const fileName = `${userId}${extension}`;
    const uploadsDir = path.resolve(__dirname, '..', '..', '..', '..', 'tmp', 'uploads');
    const filePath = path.join(uploadsDir, fileName);

    await pump(data.file, fs.createWriteStream(filePath));

    if (existingProfile.avatar && existingProfile.avatar !== fileName) {
      await fs.promises.unlink(path.join(uploadsDir, existingProfile.avatar)).catch(() => undefined);
    }

    const profile = await this.update_avatar.execute(userId, fileName);
    return this.success(reply, profile, 'Avatar atualizado com sucesso');
  }
}
