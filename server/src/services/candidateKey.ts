import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { env } from '../config/env';

export interface CandidateKeyRecord {
  key: string;
  createdAt: string;
}

function createRecord(): CandidateKeyRecord {
  return {
    key: `SN58-${randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
}

export function getOrCreateCandidateKey(): CandidateKeyRecord {
  const filePath = env.candidateKeyPath;
  if (existsSync(filePath)) {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as CandidateKeyRecord;
    if (parsed.key?.startsWith('SN58-')) {
      return parsed;
    }
  }

  const record = createRecord();
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return record;
}
