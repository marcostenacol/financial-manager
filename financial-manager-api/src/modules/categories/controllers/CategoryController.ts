import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateCategoryService } from '../services/CreateCategoryService';
import { ListCategoriesService } from '../services/ListCategoriesService';
import { UpdateCategoryService } from '../services/UpdateCategoryService';
import { DeleteCategoryService } from '../services/DeleteCategoryService';

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
    const userId = (request.user as any).sub;
    const categories = await this.listCategories.execute(userId);
    return this.success(reply, categories);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const category = await this.createCategory.execute(data, userId);
    return this.success(reply, category, 'Categoria criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const category = await this.updateCategory.execute(id, data, userId);
    return this.success(reply, category, 'Categoria atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).sub;
    await this.deleteCategory.execute(id, userId);
    return this.success(reply, null, 'Categoria removida com sucesso');
  }
}
