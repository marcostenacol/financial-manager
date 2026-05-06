import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateTransactionService } from '../services/CreateTransactionService';
import { ListTransactionsService } from '../services/ListTransactionsService';
import { DetailTransactionService } from '../services/DetailTransactionService';
import { UpdateTransactionService } from '../services/UpdateTransactionService';
import { DeleteTransactionService } from '../services/DeleteTransactionService';

@injectable()
export class TransactionController extends BaseController {
  constructor(
    @inject('CreateTransactionService') private createTransaction: CreateTransactionService,
    @inject('ListTransactionsService') private listTransactions: ListTransactionsService,
    @inject('DetailTransactionService') private detailTransaction: DetailTransactionService,
    @inject('UpdateTransactionService') private updateTransaction: UpdateTransactionService,
    @inject('DeleteTransactionService') private deleteTransaction: DeleteTransactionService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filters = request.query as any;
    const userId = (request.user as any).sub;
    const transactions = await this.listTransactions.execute(userId, filters);
    return this.success(reply, transactions);
  }

  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).sub;
    const transaction = await this.detailTransaction.execute(id, userId);
    return this.success(reply, transaction);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const transaction = await this.createTransaction.execute(data, userId);
    return this.success(reply, transaction, 'Transação criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = request.body as any;
    const userId = (request.user as any).sub;
    const transaction = await this.updateTransaction.execute(id, data, userId);
    return this.success(reply, transaction, 'Transação atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).sub;
    await this.deleteTransaction.execute(id, userId);
    return this.success(reply, null, 'Transação removida com sucesso');
  }
}
