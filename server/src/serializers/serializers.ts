import type { Activity, Miner, MinerDetails, UserPublic, Validator } from '@sn58/shared';
import type { ActivityDocument } from '../models/Activity';
import type { MinerDocument } from '../models/Miner';
import type { UserDocument } from '../models/User';
import type { ValidatorDocument } from '../models/Validator';

export function serializeUser(user: UserDocument): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeValidator(doc: ValidatorDocument): Validator {
  return {
    id: doc.id,
    uid: doc.uid,
    hotkey: doc.hotkey,
    stake: doc.stake,
    emissions: doc.emissions,
    rank: doc.rank,
    status: doc.status,
    lastUpdated: doc.lastUpdated.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeMiner(doc: MinerDocument): Miner {
  return {
    id: doc.id,
    uid: doc.uid,
    hotkey: doc.hotkey,
    score: doc.score,
    rank: doc.rank,
    emissions: doc.emissions,
    status: doc.status,
    metadata: doc.metadata ?? {},
    performanceHistory: (doc.performanceHistory ?? []).map((point) => ({
      recordedAt: point.recordedAt.toISOString(),
      score: point.score,
      emissions: point.emissions,
    })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function serializeActivity(doc: ActivityDocument): Activity {
  return {
    id: doc.id,
    type: doc.type,
    message: doc.message,
    entityType: doc.entityType,
    entityId: doc.entityId?.toString(),
    createdAt: doc.createdAt.toISOString(),
  };
}

export function serializeMinerDetails(
  doc: MinerDocument,
  activities: ActivityDocument[],
): MinerDetails {
  return {
    ...serializeMiner(doc),
    activityHistory: activities.map(serializeActivity),
  };
}
