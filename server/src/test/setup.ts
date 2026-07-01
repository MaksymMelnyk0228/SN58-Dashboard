import os from 'node:os';
import path from 'node:path';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/sn58-test';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.CANDIDATE_KEY_PATH = path.join(os.tmpdir(), `sn58-candidate-key-${process.pid}.json`);
