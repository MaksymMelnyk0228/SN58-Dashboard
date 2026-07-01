import mongoose, { Schema } from 'mongoose';
import { ENTITY_STATUSES, type EntityStatus } from '@sn58/shared';

export interface PerformancePointDocument {
  recordedAt: Date;
  score: number;
  emissions: number;
}

export interface MinerDocument extends mongoose.Document {
  uid: number;
  hotkey: string;
  score: number;
  rank: number;
  emissions: number;
  status: EntityStatus;
  metadata: Record<string, unknown>;
  performanceHistory: PerformancePointDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const performancePointSchema = new Schema<PerformancePointDocument>(
  {
    recordedAt: { type: Date, required: true },
    score: { type: Number, required: true, min: 0, max: 1 },
    emissions: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const minerSchema = new Schema<MinerDocument>(
  {
    uid: { type: Number, required: true, unique: true, min: 0 },
    hotkey: { type: String, required: true, unique: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 1 },
    rank: { type: Number, required: true, min: 1 },
    emissions: { type: Number, required: true, min: 0 },
    status: { type: String, required: true, enum: ENTITY_STATUSES },
    metadata: { type: Schema.Types.Mixed, default: {} },
    performanceHistory: { type: [performancePointSchema], default: [] },
  },
  { timestamps: true },
);

minerSchema.index({ status: 1 });
minerSchema.index({ score: -1 });

export const Miner = mongoose.model<MinerDocument>('Miner', minerSchema);
