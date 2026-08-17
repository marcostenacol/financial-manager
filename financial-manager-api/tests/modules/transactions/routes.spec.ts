import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildTestApp, signAuthToken } from '../../helpers/testApp';
import { AppError } from '@/shared/errors/AppError';
import { TransactionTypeEnum } from '@/modules/transactions/enums/TransactionTypeEnum';
import { TransactionStatusEnum } from '@/modules/transactions/enums/TransactionStatusEnum';

// O Controller resolve estes Services uma única vez, na primeira execução do plugin de rota
// (boot do Fastify) — mockar via `vi.mock()` do módulo (hoisted) garante que o Controller já
// nasce com o mock, independente de quando o boot ocorre em relação ao container do tsyringe.
const createTransactionExecute = vi.fn();
const listTransactionsExecute = vi.fn();
const detailTransactionExecute = vi.fn();

vi.mock('@/modules/transactions/services/CreateTransactionService', () => ({
  CreateTransactionService: vi.fn().mockImplementation(function () { return { execute: createTransactionExecute }; }),
}));

vi.mock('@/modules/transactions/services/ListTransactionsService', () => ({
  ListTransactionsService: vi.fn().mockImplementation(function () { return { execute: listTransactionsExecute }; }),
}));

vi.mock('@/modules/transactions/services/DetailTransactionService', () => ({
  DetailTransactionService: vi.fn().mockImplementation(function () { return { execute: detailTransactionExecute }; }),
}));

describe('Transactions routes (HTTP layer)', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await buildTestApp();
    token = await signAuthToken(app);
  });

  beforeEach(() => {
    createTransactionExecute.mockReset();
    listTransactionsExecute.mockReset();
    detailTransactionExecute.mockReset();
  });

  it('cria uma transação com sucesso (POST /)', async () => {
    const createdTransaction = {
      id: 'transaction-1',
      wallet_id: 'wallet-1',
      category_id: 'category-1',
      type: TransactionTypeEnum.EXPENSE,
      amount: 100,
      status: TransactionStatusEnum.COMPLETED,
    };
    createTransactionExecute.mockResolvedValue(createdTransaction);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        wallet_id: 'a4b7f9b2-6b8a-4e3b-9f1a-1c2d3e4f5a6b',
        category_id: 'b4b7f9b2-6b8a-4e3b-9f1a-1c2d3e4f5a6c',
        type: TransactionTypeEnum.EXPENSE,
        amount: 100,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(createdTransaction);
  });

  it('lista transações com sucesso (GET /)', async () => {
    const listResult = { transactions: [{ id: 'transaction-1' }], total: 1 };
    listTransactionsExecute.mockResolvedValue(listResult);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual(listResult);
  });

  it('retorna 422 ao criar transação com payload inválido', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        wallet_id: 'não-é-um-uuid',
        amount: -10,
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().success).toBe(false);
    expect(createTransactionExecute).not.toHaveBeenCalled();
  });

  it('retorna 404 ao buscar transação inexistente (GET /:id)', async () => {
    detailTransactionExecute.mockRejectedValue(new AppError('Transação não encontrada', 404));

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/transactions/c4b7f9b2-6b8a-4e3b-9f1a-1c2d3e4f5a6d',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe('Transação não encontrada');
  });

  it('retorna 401 ao chamar sem token de autenticação', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/transactions',
    });

    expect(response.statusCode).toBe(401);
  });
});
