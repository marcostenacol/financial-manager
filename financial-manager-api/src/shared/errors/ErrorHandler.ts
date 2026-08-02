import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './AppError';

export function errorHandler(
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    reply.status(error.status_code).send({
      success: false,
      message: error.message,
      data: null,
    });
    return;
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    const firstFieldMessage = Object.values(fieldErrors).flat().find((message): message is string => Boolean(message));

    reply.status(422).send({
      success: false,
      message: firstFieldMessage ?? 'Erro de validação',
      data: fieldErrors,
    });
    return;
  }

  console.error(error);

  reply.status(500).send({
    success: false,
    message: 'Erro interno do servidor',
    data: null,
  });
}
