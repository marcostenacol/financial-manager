import { app } from './app';
import { setupRecurrenceJob, stopRecurrenceJob } from './shared/infra/jobs/RecurrenceJob';
import { prisma } from './shared/database/PrismaClient';
import { closeRedisClient } from './shared/cache/RedisClient';

const port = Number(process.env.PORT) || 3333;

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  console.log(`[Shutdown] Sinal ${signal} recebido — encerrando aplicação graciosamente...`);

  try {
    stopRecurrenceJob();
    console.log('[Shutdown] Job de recorrências parado.');

    await app.close();
    console.log('[Shutdown] Fastify encerrado.');

    await prisma.$disconnect();
    console.log('[Shutdown] Prisma desconectado.');

    await closeRedisClient();
    console.log('[Shutdown] Redis desconectado.');

    console.log('[Shutdown] Encerramento concluído.');
    process.exit(0);
  } catch (err) {
    console.error('[Shutdown] Erro ao encerrar aplicação:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    setupRecurrenceJob();
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
