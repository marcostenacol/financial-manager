import { inject, injectable } from 'tsyringe';
import { ListTransactionsService } from './ListTransactionsService';

@injectable()
export class ExportTransactionsService {
  constructor(
    @inject('ListTransactionsService')
    private listTransactions: ListTransactionsService,
  ) {}

  async execute(userId: string): Promise<string> {
    const { transactions } = await this.listTransactions.execute(userId, { page: 1, per_page: 1_000_000 });

    const header = ['Data', 'Descrição', 'Tipo', 'Valor', 'Carteira', 'Categoria'];
    const rows = transactions.map((transaction: any) => [
      new Date(transaction.occurredAt).toLocaleDateString('pt-BR'),
      this.escapeCsvField(transaction.description || ''),
      transaction.type === 'income' ? 'Receita' : transaction.type === 'expense' ? 'Despesa' : 'Transferência',
      Number(transaction.amount).toFixed(2),
      this.escapeCsvField(transaction.wallet?.name || ''),
      this.escapeCsvField(transaction.category?.name || ''),
    ]);

    return [header, ...rows].map((row) => row.join(';')).join('\n');
  }

  private escapeCsvField(value: string): string {
    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
