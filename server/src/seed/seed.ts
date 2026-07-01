import bcrypt from 'bcrypt';
import { connectDb, disconnectDb } from '../config/db';
import { Activity } from '../models/Activity';
import { Miner } from '../models/Miner';
import { User } from '../models/User';
import { Validator } from '../models/Validator';

const DEMO_PASSWORD = 'ChangeMe123!';

function fakeHotkey(kind: 'Val' | 'Min', uid: number): string {
  const pad = uid.toString().padStart(3, '0');
  return `5Fake${kind}${pad}DemoSN58xxxxxxxxxxxxxxxxxxxx${pad}`;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function performanceSeries(baseScore: number, baseEmissions: number) {
  return Array.from({ length: 14 }, (_, index) => {
    const day = 13 - index;
    const drift = ((index % 5) - 2) * 0.012;
    const score = Number(Math.min(1, Math.max(0.05, baseScore + drift)).toFixed(4));
    const emissions = Number(Math.max(0, baseEmissions + drift * 0.01).toFixed(4));
    return { recordedAt: daysAgo(day), score, emissions };
  });
}

const USERS = [
  { email: 'admin@example.com', name: 'Local Admin' },
  { email: 'operator@example.com', name: 'Subnet Operator' },
  { email: 'viewer@example.com', name: 'Dashboard Viewer' },
];

const VALIDATORS = [
  { uid: 12, stake: 1250.45, emissions: 0.034, rank: 4, status: 'active' as const },
  { uid: 3, stake: 2140.8, emissions: 0.051, rank: 1, status: 'active' as const },
  { uid: 7, stake: 1875.12, emissions: 0.044, rank: 2, status: 'active' as const },
  { uid: 19, stake: 640.3, emissions: 0.011, rank: 5, status: 'inactive' as const },
  { uid: 28, stake: 980.0, emissions: 0.019, rank: 3, status: 'jailed' as const },
];

const STATUSES = ['active', 'active', 'active', 'active', 'inactive', 'jailed'] as const;

async function seed() {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Validator.deleteMany({}),
    Miner.deleteMany({}),
    Activity.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await User.insertMany(USERS.map((user) => ({ ...user, passwordHash })));

  const validators = await Validator.insertMany(
    VALIDATORS.map((validator) => ({
      ...validator,
      hotkey: fakeHotkey('Val', validator.uid),
      lastUpdated: daysAgo(validator.uid % 5),
    })),
  );

  const miners = await Miner.insertMany(
    Array.from({ length: 30 }, (_, index) => {
      const uid = 40 + index;
      const score = Number((0.92 - index * 0.018).toFixed(3));
      const emissions = Number((0.028 - index * 0.0006).toFixed(4));
      const status = STATUSES[index % STATUSES.length];
      return {
        uid,
        hotkey: fakeHotkey('Min', uid),
        score: Math.max(0.11, score),
        rank: index + 1,
        emissions: Math.max(0.002, emissions),
        status,
        metadata: {
          subnet: 58,
          simulated: true,
          note: 'Demo miner â€” not a live SN58 identity',
        },
        performanceHistory: performanceSeries(Math.max(0.11, score), Math.max(0.002, emissions)),
      };
    }),
  );

  const activityTypes = [
    'miner_scored',
    'emission_distributed',
    'status_changed',
    'validator_heartbeat',
    'rank_updated',
  ];

  const activities: Array<{
    type: string;
    message: string;
    entityType: 'miner' | 'validator' | 'system';
    entityId?: (typeof miners)[number]['_id'];
    createdAt: Date;
  }> = Array.from({ length: 56 }, (_, index) => {
    const miner = miners[index % miners.length];
    const validator = validators[index % validators.length];
    const useMiner = index % 4 !== 0;
    const type = activityTypes[index % activityTypes.length];
    return {
      type,
      message: useMiner
        ? `Simulated ${type.replaceAll('_', ' ')} for miner UID ${miner.uid}`
        : `Simulated ${type.replaceAll('_', ' ')} for validator UID ${validator.uid}`,
      entityType: useMiner ? ('miner' as const) : ('validator' as const),
      entityId: useMiner ? miner._id : validator._id,
      createdAt: daysAgo(index % 14),
    };
  });

  activities.push({
    type: 'system_notice',
    message: 'Local SN58-inspired simulation seeded. No live Bittensor connection is present.',
    entityType: 'system',
    createdAt: new Date(),
  });

  await Activity.insertMany(activities);

  console.log('Seed complete.');
  console.log('Development-only login: admin@example.com / ChangeMe123!');
  console.log('Do not use these credentials outside local development.');
  console.log(`Users: ${USERS.length}, validators: ${validators.length}, miners: ${miners.length}, activities: ${activities.length}`);

  await disconnectDb();
}

seed().catch(async (error) => {
  console.error('Seed failed', error);
  await disconnectDb();
  process.exit(1);
});
