import { app } from './app';
import { setupRecurrenceJob } from './shared/infra/jobs/RecurrenceJob';

const port = Number(process.env.PORT) || 3333;

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
