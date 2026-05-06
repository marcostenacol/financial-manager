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
    reply.status(422).send({
      success: false,
      message: 'Erro de validação',
      data: error.flatten().fieldErrors,
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
