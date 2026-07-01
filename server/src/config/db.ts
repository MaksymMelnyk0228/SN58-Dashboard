import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(uri = env.mongoUri): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
