import { create } from 'zustand';
import { Checklist, ChecklistItem, ChecklistStatus } from '../types/checklist';

interface ChecklistStore {
  checklists: Checklist[];
  currentChecklist: Checklist | null;
  loading: boolean;
  loadingChecklists: boolean;
  error: string | null;

  // Actions
  fetchChecklists: () => Promise<void>;
  fetchChecklist: (id: string) => Promise<void>;
  createChecklist: (title: string, description?: string) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  setCurrentChecklist: (id: string) => void;
  updateChecklistNotes: (checklistId: string, notes: string) => Promise<void>;
  updateChecklist: (
    checklistId: string,
    updates: Partial<Checklist>
  ) => Promise<void>;

  addItem: (
    checklistId: string,
    title: string,
    description?: string
  ) => Promise<void>;
  updateItemStatus: (
    checklistId: string,
    itemId: string,
    status: ChecklistStatus
  ) => Promise<void>;
  updateItemReason: (
    checklistId: string,
    itemId: string,
    reason: string
  ) => Promise<void>;
  addImageToItem: (
    checklistId: string,
    itemId: string,
    imageFile: File
  ) => Promise<void>;
  removeImageFromItem: (
    checklistId: string,
    itemId: string,
    imageId: string
  ) => Promise<void>;
  deleteItem: (checklistId: string, itemId: string) => Promise<void>;

  // Utility
  getChecklistProgress: (checklistId: string) => {
    completed: number;
    total: number;
  };
}

// Helper function to ensure dates are Date objects
const ensureDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

// Helper function to normalize checklist data from API
const normalizeChecklist = (data: unknown): Checklist => {
  const d = data as {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    notes?: string;
    items?: unknown[];
    isCompleted?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  };

  const normalizeItem = (item: unknown): ChecklistItem => {
    const i = item as {
      id: string;
      title: string;
      description?: string;
      status: 'completed' | 'in-progress' | 'not-started';
      reason?: string;
      images?: unknown[];
      createdAt: Date | string;
      updatedAt: Date | string;
    };
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      status: i.status || 'not-started',
      reason: i.reason,
      images: (i.images || []) as ChecklistItem['images'],
      createdAt: ensureDate(i.createdAt),
      updatedAt: ensureDate(i.updatedAt),
    };
  };

  return {
    id: d._id || d.id || '',
    title: d.title || '',
    description: d.description,
    notes: d.notes,
    items: (d.items || []).map(normalizeItem),
    isCompleted: d.isCompleted || false,
    createdAt: ensureDate(d.createdAt),
    updatedAt: ensureDate(d.updatedAt),
  };
};

export const useChecklistStore = create<ChecklistStore>((set, get) => ({
  checklists: [],
  currentChecklist: null,
  loading: false,
  loadingChecklists: false,
  error: null,

  fetchChecklists: async () => {
    set({ loading: true, loadingChecklists: true, error: null });
    try {
      const response = await fetch('/api/checklists');
      const result = await response.json();
      if (result.success) {
        set({
          checklists: result.data.map(normalizeChecklist),
          loading: false,
          loadingChecklists: false,
        });
      } else {
        set({
          error: result.error,
          loading: false,
          loadingChecklists: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Checklist'ler getirilemedi";
      set({
        error: errorMessage,
        loading: false,
        loadingChecklists: false,
      });
    }
  },

  fetchChecklist: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/checklists/${id}`);
      const result = await response.json();
      if (result.success) {
        const checklist = normalizeChecklist(result.data);
        set({
          currentChecklist: checklist,
          checklists: get().checklists.map((c) =>
            c.id === id ? checklist : c
          ),
          loading: false,
        });
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Checklist getirilemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createChecklist: async (title: string, description?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const result = await response.json();
      if (result.success) {
        const newChecklist = normalizeChecklist(result.data);
        set((state) => ({
          checklists: [newChecklist, ...state.checklists],
          currentChecklist: newChecklist,
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Checklist oluşturulamadı';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteChecklist: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          checklists: state.checklists.filter((list) => list.id !== id),
          currentChecklist:
            state.currentChecklist?.id === id ? null : state.currentChecklist,
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Checklist silinemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  setCurrentChecklist: (id: string) => {
    const checklist = get().checklists.find((list) => list.id === id);
    if (checklist) {
      set({ currentChecklist: normalizeChecklist(checklist) });
    } else {
      // If not in local state, fetch from API
      get().fetchChecklist(id);
    }
  },

  updateChecklistNotes: async (checklistId: string, notes: string) => {
    await get().updateChecklist(checklistId, { notes });
  },

  updateChecklist: async (checklistId: string, updates: Partial<Checklist>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      if (result.success) {
        const updatedChecklist = normalizeChecklist(result.data);
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === checklistId ? updatedChecklist : c
          ),
          currentChecklist:
            state.currentChecklist?.id === checklistId
              ? updatedChecklist
              : state.currentChecklist,
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Checklist güncellenemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  addItem: async (checklistId: string, title: string, description?: string) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      throw new Error('Checklist bulunamadı');
    }

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      title,
      description,
      status: 'not-started',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedItems = [...checklist.items, newItem];

    await state.updateChecklist(checklistId, { items: updatedItems });
  },

  updateItemStatus: async (
    checklistId: string,
    itemId: string,
    status: ChecklistStatus
  ) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      throw new Error('Checklist bulunamadı');
    }

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status,
            updatedAt: new Date(),
            reason: status === 'completed' ? undefined : item.reason,
          }
        : item
    );

    await state.updateChecklist(checklistId, { items: updatedItems });
  },

  updateItemReason: async (
    checklistId: string,
    itemId: string,
    reason: string
  ) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      throw new Error('Checklist bulunamadı');
    }

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, reason, updatedAt: new Date() } : item
    );

    await state.updateChecklist(checklistId, { items: updatedItems });
  },

  addImageToItem: async (
    checklistId: string,
    itemId: string,
    imageFile: File
  ) => {
    // Convert image to base64 to avoid blob URL issues
    const reader = new FileReader();
    const imageData = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
    });

    const newImage = {
      id: crypto.randomUUID(),
      name: imageFile.name,
      url: imageData,
      size: imageFile.size,
      type: imageFile.type,
    };

    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      throw new Error('Checklist bulunamadı');
    }

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            images: [...(item.images || []), newImage],
            updatedAt: new Date(),
          }
        : item
    );

    await state.updateChecklist(checklistId, { items: updatedItems });
  },

  removeImageFromItem: async (
    checklistId: string,
    itemId: string,
    imageId: string
  ) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      throw new Error('Checklist bulunamadı');
    }

    const updatedItems = checklist.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            images: item.images?.filter((img) => img.id !== imageId),
            updatedAt: new Date(),
          }
        : item
    );

    await state.updateChecklist(checklistId, { items: updatedItems });
  },

  deleteItem: async (checklistId: string, itemId: string) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      throw new Error('Checklist bulunamadı');
    }

    const updatedItems = checklist.items.filter((item) => item.id !== itemId);

    await state.updateChecklist(checklistId, { items: updatedItems });
  },

  getChecklistProgress: (checklistId: string) => {
    const checklist = get().checklists.find((list) => list.id === checklistId);
    if (!checklist) return { completed: 0, total: 0 };

    const completed = checklist.items.filter(
      (item) => item.status === 'completed'
    ).length;
    const total = checklist.items.length;

    return { completed, total };
  },
}));
