import { inject, injectable } from 'tsyringe';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { ListTransactionsService } from '@/modules/transactions/services/ListTransactionsService';

interface ExportReportFilters {
  format: 'pdf' | 'excel';
  start_date?: string;
  end_date?: string;
}

@injectable()
export class ExportReportService {
  constructor(
    @inject('ListTransactionsService')
    private listTransactions: ListTransactionsService,
  ) {}

  async execute(userId: string, filters: ExportReportFilters): Promise<Buffer> {
    const { transactions } = await this.listTransactions.execute(userId, {
      start_date: filters.start_date,
      end_date: filters.end_date,
      page: 1,
      per_page: 1_000_000,
    });

    if (filters.format === 'excel') {
      return this.buildExcel(transactions);
    }

    return this.buildPdf(transactions);
  }

  private async buildExcel(transactions: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Relatório');

    sheet.columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Descrição', key: 'description', width: 30 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Carteira', key: 'wallet', width: 20 },
      { header: 'Categoria', key: 'category', width: 20 },
    ];

    for (const transaction of transactions) {
      sheet.addRow({
        date: new Date(transaction.occurredAt).toLocaleDateString('pt-BR'),
        description: transaction.description || '',
        type: this.translateType(transaction.type),
        amount: Number(transaction.amount),
        wallet: transaction.wallet?.name || '',
        category: transaction.category?.name || '',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private buildPdf(transactions: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Relatório de Transações', { align: 'center' });
      doc.moveDown();

      for (const transaction of transactions) {
        const date = new Date(transaction.occurredAt).toLocaleDateString('pt-BR');
        const amount = Number(transaction.amount).toFixed(2);
        doc
          .fontSize(10)
          .text(
            `${date} — ${transaction.description || ''} — ${this.translateType(transaction.type)} — R$ ${amount} — ${transaction.wallet?.name || ''} / ${transaction.category?.name || ''}`,
          );
      }

      doc.end();
    });
  }

  private translateType(type: string): string {
    if (type === 'income') return 'Receita';
    if (type === 'expense') return 'Despesa';
    return 'Transferência';
  }
}
