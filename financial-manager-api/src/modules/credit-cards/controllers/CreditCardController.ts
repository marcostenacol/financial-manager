import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'tsyringe';
import { BaseController } from '@/base/http/BaseController';
import { ListCreditCardsService } from '../services/ListCreditCardsService';
import { ListWalletInvoicesService } from '../services/ListWalletInvoicesService';
import { GetInvoiceDetailService } from '../services/GetInvoiceDetailService';
import { RegisterInvoicePaymentService } from '../services/RegisterInvoicePaymentService';
import { DeleteInvoicePaymentService } from '../services/DeleteInvoicePaymentService';
import { RegisterInvoicePaymentDTO } from '../dtos/RegisterInvoicePaymentDTO';

@injectable()
export class CreditCardController extends BaseController {
  constructor(
    @inject('ListCreditCardsService') private listCreditCards: ListCreditCardsService,
    @inject('ListWalletInvoicesService') private listWalletInvoices: ListWalletInvoicesService,
    @inject('GetInvoiceDetailService') private getInvoiceDetail: GetInvoiceDetailService,
    @inject('RegisterInvoicePaymentService') private registerInvoicePayment: RegisterInvoicePaymentService,
    @inject('DeleteInvoicePaymentService') private deleteInvoicePayment: DeleteInvoicePaymentService,
  ) {
    super();
  }

  async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const cards = await this.listCreditCards.execute(request.user.sub, request.organizationIds);
    return this.success(reply, cards);
  }

  async invoices(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { walletId } = request.params as { walletId: string };
    const invoices = await this.listWalletInvoices.execute(walletId, request.user.sub, request.organizationIds);
    return this.success(reply, invoices);
  }

  async invoiceDetail(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { walletId, invoiceId } = request.params as { walletId: string; invoiceId: string };
    const invoice = await this.getInvoiceDetail.execute(walletId, invoiceId, request.user.sub, request.organizationIds);
    return this.success(reply, invoice);
  }

  async storePayment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { walletId, invoiceId } = request.params as { walletId: string; invoiceId: string };
    const data = RegisterInvoicePaymentDTO.parse(request.body);
    const payment = await this.registerInvoicePayment.execute(walletId, invoiceId, data, request.user.sub, request.organizationIds);
    return this.success(reply, payment, 'Pagamento registrado com sucesso', 201);
  }

  async deletePayment(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { walletId, invoiceId, paymentId } = request.params as { walletId: string; invoiceId: string; paymentId: string };
    await this.deleteInvoicePayment.execute(walletId, invoiceId, paymentId, request.user.sub, request.organizationIds);
    return this.success(reply, null, 'Pagamento removido com sucesso');
  }
}
