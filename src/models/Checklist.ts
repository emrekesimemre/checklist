import mongoose, { Schema, Model } from 'mongoose';
import {
  Checklist as IChecklist,
  ChecklistItem,
  ImageFile,
} from '../types/checklist';

const ImageFileSchema = new Schema<ImageFile>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

const ChecklistItemSchema = new Schema<ChecklistItem>({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'not-started'],
    required: true,
    default: 'not-started',
  },
  reason: {
    type: String,
    trim: true,
  },
  images: {
    type: [ImageFileSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ChecklistSchema = new Schema<IChecklist>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    items: {
      type: [ChecklistItemSchema],
      required: true,
      default: [],
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
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
ChecklistSchema.index({ createdAt: -1 });
ChecklistSchema.index({ isCompleted: 1 });

const Checklist: Model<IChecklist> =
  mongoose.models.Checklist ||
  mongoose.model<IChecklist>('Checklist', ChecklistSchema);

export default Checklist;
