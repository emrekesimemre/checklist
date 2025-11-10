import mongoose, { Schema, Model } from 'mongoose';
import { Konu as IKonu } from '../types/evaluation';

const KonuSchema = new Schema<IKonu>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const Konu: Model<IKonu> =
  mongoose.models.Konu || mongoose.model<IKonu>('Konu', KonuSchema);

export default Konu;
