import cron, { ScheduledTask } from 'node-cron';
import { container } from 'tsyringe';
import { ProcessRecurrenceService } from '@/modules/recurrences/services/ProcessRecurrenceService';

let scheduledTask: ScheduledTask | undefined;

export const setupRecurrenceJob = () => {
  // Roda todo dia à meia-noite
  scheduledTask = cron.schedule('0 0 * * *', async () => {
    console.log('[Job] Iniciando processamento de recorrências...');

    try {
      const processRecurrence = container.resolve(ProcessRecurrenceService);
      await processRecurrence.execute();
      console.log('[Job] Processamento de recorrências finalizado com sucesso.');
    } catch (error) {
      console.error('[Job] Erro ao processar recorrências:', error);
    }
  });

  return scheduledTask;
};

export const stopRecurrenceJob = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = undefined;
  }
};
