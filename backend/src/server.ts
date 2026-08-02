import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function startServer(): Promise<void> {
  await connectDatabase();

  app.listen(env.port, () => {
    console.info(`Orange API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start Orange API.', error);
  process.exit(1);
});
