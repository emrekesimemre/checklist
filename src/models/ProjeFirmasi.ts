import mongoose, { Schema, Model } from 'mongoose';
import { ProjeFirmasi as IProjeFirmasi } from '../types/evaluation';

const ProjeFirmasiSchema = new Schema<IProjeFirmasi>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // createdAt'i manuel yönetiyoruz
  }
);

const ProjeFirmasi: Model<IProjeFirmasi> =
  mongoose.models.ProjeFirmasi ||
  mongoose.model<IProjeFirmasi>('ProjeFirmasi', ProjeFirmasiSchema);

export default ProjeFirmasi;
