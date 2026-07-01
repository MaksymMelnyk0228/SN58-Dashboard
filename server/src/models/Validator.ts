import mongoose, { Schema } from 'mongoose';
import { ENTITY_STATUSES, type EntityStatus } from '@sn58/shared';

export interface ValidatorDocument extends mongoose.Document {
  uid: number;
  hotkey: string;
  stake: number;
  emissions: number;
  rank: number;
  status: EntityStatus;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const validatorSchema = new Schema<ValidatorDocument>(
  {
    uid: { type: Number, required: true, unique: true, min: 0 },
    hotkey: { type: String, required: true, unique: true, trim: true },
    stake: { type: Number, required: true, min: 0 },
    emissions: { type: Number, required: true, min: 0 },
    rank: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, enum: ENTITY_STATUSES },
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

validatorSchema.index({ status: 1 });

export const Validator = mongoose.model<ValidatorDocument>('Validator', validatorSchema);
