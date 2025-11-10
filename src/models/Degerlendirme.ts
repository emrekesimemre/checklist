import mongoose, { Schema, Model } from 'mongoose';
import { Degerlendirme as IDegerlendirme, Puan } from '../types/evaluation';

const PuanSchema = new Schema<Puan>({
  konuId: {
    type: String,
    required: true,
  },
  puan: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
});

const DegerlendirmeSchema = new Schema<IDegerlendirme>(
  {
    isAdi: {
      type: String,
      required: true,
      trim: true,
    },
    projeFirmasiId: {
      type: String,
      required: true,
    },
    projeFirmasiName: {
      type: String,
      required: true,
      trim: true,
    },
    puanlar: {
      type: [PuanSchema],
      required: true,
      default: [],
    },
    toplamPuan: {
      type: Number,
      required: true,
      default: 0,
    },
    notlar: {
      type: String,
      trim: true,
    },
    yil: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index'ler
DegerlendirmeSchema.index({ projeFirmasiId: 1 });
DegerlendirmeSchema.index({ yil: 1 });
DegerlendirmeSchema.index({ createdAt: -1 });

const Degerlendirme: Model<IDegerlendirme> =
  mongoose.models.Degerlendirme ||
  mongoose.model<IDegerlendirme>('Degerlendirme', DegerlendirmeSchema);

export default Degerlendirme;
