import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { deliverNextOutboxEvent } from './services/pos-integration.service';

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, () => {
    console.info(`Orange API listening on http://localhost:${env.port}`);
  });
  if (env.integrationEnabled) {
    const run = () => void deliverNextOutboxEvent().catch((error: unknown) => console.error('POS outbox worker failed.', error));
    run(); setInterval(run, env.integrationWorkerIntervalMs).unref();
  }
}

startServer().catch((error: unknown) => {
  console.error('Failed to start Orange API.', error);
  process.exit(1);
});
