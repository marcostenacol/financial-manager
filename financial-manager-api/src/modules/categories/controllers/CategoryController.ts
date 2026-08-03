import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { ProfileScope } from '@prisma/client';
import { BaseController } from '@/base/http/BaseController';
import { CreateCategoryService } from '../services/CreateCategoryService';
import { ListCategoriesService } from '../services/ListCategoriesService';
import { UpdateCategoryService } from '../services/UpdateCategoryService';
import { DeleteCategoryService } from '../services/DeleteCategoryService';
import { CreateCategoryDTO } from '../dtos/CreateCategoryDTO';
import { UpdateCategoryDTO } from '../dtos/UpdateCategoryDTO';

@injectable()
export class CategoryController extends BaseController {
  constructor(
    @inject('CreateCategoryService') private createCategory: CreateCategoryService,
    @inject('ListCategoriesService') private listCategories: ListCategoriesService,
    @inject('UpdateCategoryService') private updateCategory: UpdateCategoryService,
    @inject('DeleteCategoryService') private deleteCategory: DeleteCategoryService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { scope } = request.query as { scope?: ProfileScope };
    const categories = await this.listCategories.execute(userId, scope, request.organizationIds);
    return this.success(reply, categories);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateCategoryDTO.parse(request.body);
    const userId = request.user.sub;
    const category = await this.createCategory.execute(data, userId);
    return this.success(reply, category, 'Categoria criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = UpdateCategoryDTO.parse(request.body);
    const userId = request.user.sub;
    const category = await this.updateCategory.execute(id, data, userId, request.organizationIds);
    return this.success(reply, category, 'Categoria atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    await this.deleteCategory.execute(id, userId, request.organizationIds);
    return this.success(reply, null, 'Categoria removida com sucesso');
  }
}
