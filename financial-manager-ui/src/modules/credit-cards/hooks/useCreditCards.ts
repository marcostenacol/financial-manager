import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  closingDay: number | null;
  dueDay: number | null;
}

export interface CreditCardInvoice {
  id: string;
  referenceMonth: string;
  closingDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'open' | 'closed' | 'partially_paid' | 'paid';
}

export interface InvoicePayment {
  id: string;
  amount: number;
  paidAt: string;
  note: string | null;
}

export interface InvoiceTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  occurredAt: string;
  person?: { id: string; name: string } | null;
}

export interface InvoiceDetail extends CreditCardInvoice {
  transactions: InvoiceTransaction[];
  payments: InvoicePayment[];
}

export interface RegisterInvoicePaymentInput {
  amount: number;
  paid_at?: string;
  note?: string;
}

export function useCreditCards() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/credit-cards');
      setCards(response.data.data);
      return response.data.data as CreditCard[];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async (walletId: string) => {
    const response = await api.get(`/credit-cards/${walletId}/invoices`);
    return response.data.data as CreditCardInvoice[];
  }, []);

  const loadInvoiceDetail = useCallback(async (walletId: string, invoiceId: string) => {
    const response = await api.get(`/credit-cards/${walletId}/invoices/${invoiceId}`);
    return response.data.data as InvoiceDetail;
  }, []);

  const registerPayment = useCallback(async (walletId: string, invoiceId: string, data: RegisterInvoicePaymentInput) => {
    const response = await api.post(`/credit-cards/${walletId}/invoices/${invoiceId}/payments`, data);
    return response.data.data as InvoicePayment;
  }, []);

  const deletePayment = useCallback(async (walletId: string, invoiceId: string, paymentId: string) => {
    await api.delete(`/credit-cards/${walletId}/invoices/${invoiceId}/payments/${paymentId}`);
  }, []);

  return { cards, loading, loadCards, loadInvoices, loadInvoiceDetail, registerPayment, deletePayment };
}
