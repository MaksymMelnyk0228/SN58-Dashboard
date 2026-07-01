import mongoose, { Schema } from 'mongoose';
import { ACTIVITY_ENTITY_TYPES, type ActivityEntityType } from '@sn58/shared';

export interface ActivityDocument extends mongoose.Document {
  type: string;
  message: string;
  entityType: ActivityEntityType;
  entityId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<ActivityDocument>(
  {
    type: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, enum: ACTIVITY_ENTITY_TYPES },
    entityId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

export const Activity = mongoose.model<ActivityDocument>('Activity', activitySchema);
