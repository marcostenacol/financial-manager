import { inject, injectable } from 'tsyringe';
import { ReportRepositoryInterface } from '../repositories/contracts/ReportRepositoryInterface';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

@injectable()
export class ExportDashboardService {
  constructor(
    @inject('ReportRepository')
    private reportRepository: ReportRepositoryInterface,
  ) {}

  async execute(user_id: string, format: 'pdf' | 'excel', start_date?: Date, end_date?: Date): Promise<Buffer> {
    const overview = await this.reportRepository.getDashboardOverview(user_id, start_date, end_date);
    
    // Pegar despesas por categoria também (usando o mês do start_date ou atual)
    const targetDate = start_date || new Date();
    const expenses = await this.reportRepository.getExpensesByCategory(
      user_id, 
      targetDate.getMonth() + 1, 
      targetDate.getFullYear()
    );

    if (format === 'pdf') {
      return this.generatePDF(overview, expenses);
    }

    return this.generateExcel(overview, expenses);
  }

  private async generatePDF(overview: any, expenses: any[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fillColor('#1e293b').fontSize(24).text('Relatório Financeiro Personalizado', { align: 'center' });
      doc.moveDown(2);

      // Overview Section
      doc.fillColor('#334155').fontSize(16).text('Resumo do Período');
      doc.rect(doc.x, doc.y + 5, 500, 2).fill('#e2e8f0');
      doc.moveDown(1.5);

      doc.fillColor('#475569').fontSize(12);
      doc.text(`Saldo Total: `, { continued: true }).fillColor('#000').text(`R$ ${overview.total_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      doc.moveDown(0.5);
      doc.fillColor('#475569').text(`Receita: `, { continued: true }).fillColor('#10b981').text(`R$ ${overview.monthly_income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      doc.moveDown(0.5);
      doc.fillColor('#475569').text(`Despesa: `, { continued: true }).fillColor('#ef4444').text(`R$ ${overview.monthly_expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      
      doc.moveDown(2.5);

      // Categories Section
      doc.fillColor('#334155').fontSize(16).text('Gastos por Categoria');
      doc.rect(doc.x, doc.y + 5, 500, 2).fill('#e2e8f0');
      doc.moveDown(1.5);

      expenses.forEach(exp => {
        doc.fillColor('#475569').fontSize(11).text(`${exp.category_name}: `, { continued: true })
           .fillColor('#000').text(`R$ ${exp.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${exp.percentage}%)`);
        doc.moveDown(0.3);
      });

      if (expenses.length === 0) {
        doc.fillColor('#94a3b8').fontSize(10).text('Nenhuma despesa registrada no período.');
      }

      // Footer
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94a3b8').fontSize(8).text(
          `Gerado em ${new Date().toLocaleString('pt-BR')} — Sistema Financeiro`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      doc.end();
    });
  }

  private async generateExcel(overview: any, expenses: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Resumo');

    // Overview
    sheet.addRows([
      ['Relatório Financeiro'],
      [''],
      ['Métrica', 'Valor'],
      ['Saldo Total', overview.total_balance],
      ['Receita do Período', overview.monthly_income],
      ['Despesa do Período', overview.monthly_expense],
      [''],
      ['Gastos por Categoria'],
      ['Categoria', 'Valor', 'Percentual']
    ]);

    expenses.forEach(exp => {
      sheet.addRow([exp.category_name, exp.total, exp.percentage / 100]);
    });

    // Estilização básica
    sheet.getColumn(2).numFmt = '"R$ "#,##0.00';
    sheet.getColumn(3).numFmt = '0.00%';
    sheet.getRow(1).font = { bold: true, size: 16 };
    sheet.getRow(3).font = { bold: true };
    sheet.getRow(8).font = { bold: true };

    return (await workbook.xlsx.writeBuffer() as unknown) as Buffer;
  }
}
