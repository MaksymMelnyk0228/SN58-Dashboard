import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

let mongod: MongoMemoryServer | undefined;

export const app = createApp();

export async function startMemoryDb(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function stopMemoryDb(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

export async function clearDb(): Promise<void> {
  const collections = await mongoose.connection.db?.collections();
  if (!collections) return;
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function createTestUser(overrides?: {
  email?: string;
  name?: string;
  password?: string;
}) {
  const password = overrides?.password ?? 'ChangeMe123!';
  const user = await User.create({
    email: overrides?.email ?? 'admin@example.com',
    name: overrides?.name ?? 'Test Admin',
    passwordHash: await bcrypt.hash(password, 10),
  });
  return { user, password };
}

export async function loginAs(email = 'admin@example.com', password = 'ChangeMe123!') {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.data.token as string;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
