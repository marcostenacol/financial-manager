import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { CreateTransactionService } from '../services/CreateTransactionService';
import { ListTransactionsService } from '../services/ListTransactionsService';
import { DetailTransactionService } from '../services/DetailTransactionService';
import { UpdateTransactionService } from '../services/UpdateTransactionService';
import { DeleteTransactionService } from '../services/DeleteTransactionService';
import { TransferService } from '../services/TransferService';
import { ExportTransactionsService } from '../services/ExportTransactionsService';
import { ClearAllTransactionsService } from '../services/ClearAllTransactionsService';
import { CreateTransferDTO } from '../dtos/CreateTransferDTO';
import { CreateTransactionDTO } from '../dtos/CreateTransactionDTO';
import { UpdateTransactionDTO } from '../dtos/UpdateTransactionDTO';
import { ListTransactionsFilterDTO } from '../dtos/ListTransactionsFilterDTO';
import { ClearAllTransactionsDTO } from '../dtos/ClearAllTransactionsDTO';

@injectable()
export class TransactionController extends BaseController {
  constructor(
    @inject('CreateTransactionService') private createTransaction: CreateTransactionService,
    @inject('ListTransactionsService') private listTransactions: ListTransactionsService,
    @inject('DetailTransactionService') private detailTransaction: DetailTransactionService,
    @inject('UpdateTransactionService') private updateTransaction: UpdateTransactionService,
    @inject('DeleteTransactionService') private deleteTransaction: DeleteTransactionService,
    @inject('TransferService') private transferService: TransferService,
    @inject('ExportTransactionsService') private exportTransactions: ExportTransactionsService,
    @inject('ClearAllTransactionsService') private clearAllTransactions: ClearAllTransactionsService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filters = ListTransactionsFilterDTO.parse(request.query);
    const userId = request.user.sub;
    const transactions = await this.listTransactions.execute(userId, filters);
    return this.success(reply, transactions);
  }

  async export(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const csv = await this.exportTransactions.execute(userId);
    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="transacoes.csv"')
      .send(csv);
  }

  async show(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const transaction = await this.detailTransaction.execute(id, userId);
    return this.success(reply, transaction);
  }

  async store(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = CreateTransactionDTO.parse(request.body);
    const userId = request.user.sub;
    const transaction = await this.createTransaction.execute(data, userId);
    return this.success(reply, transaction, 'Transação criada com sucesso', 201);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const data = UpdateTransactionDTO.parse(request.body);
    const userId = request.user.sub;
    const transaction = await this.updateTransaction.execute(id, data, userId);
    return this.success(reply, transaction, 'Transação atualizada com sucesso');
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    await this.deleteTransaction.execute(id, userId);
    return this.success(reply, null, 'Transação removida com sucesso');
  }

  async clearAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const { reset_balances } = ClearAllTransactionsDTO.parse(request.body ?? {});
    await this.clearAllTransactions.execute(userId, reset_balances);
    return this.success(reply, null, 'Transações removidas com sucesso');
  }

  async transfer(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user.sub;
    const data = CreateTransferDTO.parse(request.body);

    await this.transferService.execute(data, userId);
    return this.success(reply, null, 'Transferência realizada com sucesso');
  }
}
