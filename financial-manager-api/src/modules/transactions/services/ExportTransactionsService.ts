import { inject, injectable } from 'tsyringe';
import { TransactionRepositoryInterface } from '../repositories/contracts/TransactionRepositoryInterface';

@injectable()
export class ExportTransactionsService {
  constructor(
    @inject('TransactionRepository')
    private transactionRepository: TransactionRepositoryInterface,
  ) {}

  async execute(userId: string): Promise<string> {
    const { data: transactions } = await this.transactionRepository.findByUserId(userId, {});

    const header = 'Data,Descrição,Categoria,Valor,Tipo,Status\n';
    const rows = transactions.map(t => {
      const date = new Date(t.occurredAt).toLocaleDateString('pt-BR');
      const amount = Number(t.amount).toFixed(2);
      return `${date},"${t.description || ''}","${(t as any).category?.name || ''}",${amount},${t.type},${t.status}`;
    }).join('\n');

    return header + rows;
  }
}
