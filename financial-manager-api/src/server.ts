import { app } from './app';

const port = Number(process.env.PORT) || 3333;

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
