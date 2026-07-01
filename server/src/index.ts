import { env } from './config/env';
import { connectDb } from './config/db';
import { createApp } from './app';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`SN58 simulation API listening on http://localhost:${env.port}`);
    console.log('This server is a local SN58-inspired simulation, not a live Bittensor node.');
  });
}

main().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
