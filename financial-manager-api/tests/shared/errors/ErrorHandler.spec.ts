import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '@/shared/errors/ErrorHandler';
import { AppError } from '@/shared/errors/AppError';

function createMockReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply;
}

describe('errorHandler', () => {
  it('should surface the first field-specific Zod message as the top-level message', () => {
    const schema = z.object({ name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres') });
    const result = schema.safeParse({ name: 'a' });
    const reply = createMockReply();

    expect(result.success).toBe(false);
    if (!result.success) {
      errorHandler(result.error, {} as any, reply);
    }

    expect(reply.status).toHaveBeenCalledWith(422);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'O nome deve ter no mínimo 3 caracteres',
      }),
    );
  });

  it('should use the AppError message and status_code as-is', () => {
    const reply = createMockReply();

    errorHandler(new AppError('Carteira não encontrada', 404), {} as any, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Carteira não encontrada',
      data: null,
    });
  });

  it('should fall back to a generic message for unexpected errors, without leaking details', () => {
    const reply = createMockReply();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('detalhe interno sensível'), {} as any, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      success: false,
      message: 'Erro interno do servidor',
      data: null,
    });
    consoleSpy.mockRestore();
  });
});
