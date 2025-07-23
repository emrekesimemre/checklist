export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'not-started';
  reason?: string; // Bitmediyse neden açıklaması
  images?: ImageFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  notes?: string; // Checklist sonundaki genel notlar
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

export type ChecklistStatus = 'completed' | 'in-progress' | 'not-started';
