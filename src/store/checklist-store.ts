import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Checklist, ChecklistItem, ChecklistStatus } from '../types/checklist';

interface ChecklistStore {
  checklists: Checklist[];
  currentChecklist: Checklist | null;

  // Actions
  createChecklist: (title: string, description?: string) => void;
  deleteChecklist: (id: string) => void;
  setCurrentChecklist: (id: string) => void;

  addItem: (checklistId: string, title: string, description?: string) => void;
  updateItemStatus: (
    checklistId: string,
    itemId: string,
    status: ChecklistStatus
  ) => void;
  updateItemReason: (
    checklistId: string,
    itemId: string,
    reason: string
  ) => void;
  addImageToItem: (
    checklistId: string,
    itemId: string,
    imageFile: File
  ) => Promise<void>;
  removeImageFromItem: (
    checklistId: string,
    itemId: string,
    imageId: string
  ) => void;
  deleteItem: (checklistId: string, itemId: string) => void;

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

// Helper function to normalize checklist data
const normalizeChecklist = (
  checklist: Partial<Checklist> & {
    id: string;
    title: string;
    items?: Partial<ChecklistItem>[];
  }
): Checklist =>
  ({
    ...checklist,
    createdAt: ensureDate(checklist.createdAt || new Date()),
    updatedAt: ensureDate(checklist.updatedAt || new Date()),
    isCompleted: checklist.isCompleted || false,
    items:
      checklist.items?.map(
        (item: Partial<ChecklistItem> & { id: string; title: string }) =>
          ({
            ...item,
            createdAt: ensureDate(item.createdAt || new Date()),
            updatedAt: ensureDate(item.updatedAt || new Date()),
            status: item.status || 'not-started',
            images: item.images || [],
          } as ChecklistItem)
      ) || [],
  } as Checklist);

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      checklists: [],
      currentChecklist: null,

      createChecklist: (title: string, description?: string) => {
        const newChecklist: Checklist = {
          id: crypto.randomUUID(),
          title,
          description,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isCompleted: false,
        };

        set((state) => ({
          checklists: [...state.checklists, newChecklist],
          currentChecklist: newChecklist,
        }));
      },

      deleteChecklist: (id: string) => {
        set((state) => ({
          checklists: state.checklists.filter((list) => list.id !== id),
          currentChecklist:
            state.currentChecklist?.id === id ? null : state.currentChecklist,
        }));
      },

      setCurrentChecklist: (id: string) => {
        const checklist = get().checklists.find((list) => list.id === id);
        if (checklist) {
          set({ currentChecklist: normalizeChecklist(checklist) });
        }
      },

      addItem: (checklistId: string, title: string, description?: string) => {
        const newItem: ChecklistItem = {
          id: crypto.randomUUID(),
          title,
          description,
          status: 'not-started',
          images: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          checklists: state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  items: [...checklist.items, newItem],
                  updatedAt: new Date(),
                }
              : checklist
          ),
          currentChecklist:
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  items: [...state.currentChecklist.items, newItem],
                  updatedAt: new Date(),
                }
              : state.currentChecklist,
        }));
      },

      updateItemStatus: (
        checklistId: string,
        itemId: string,
        status: ChecklistStatus
      ) => {
        set((state) => {
          const updateItems = (items: ChecklistItem[]) =>
            items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status,
                    updatedAt: new Date(),
                    reason: status === 'completed' ? undefined : item.reason,
                  }
                : item
            );

          const updatedChecklists = state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  items: updateItems(checklist.items),
                  updatedAt: new Date(),
                }
              : checklist
          );

          const updatedCurrentChecklist =
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  items: updateItems(state.currentChecklist.items),
                  updatedAt: new Date(),
                }
              : state.currentChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: updatedCurrentChecklist,
          };
        });
      },

      updateItemReason: (
        checklistId: string,
        itemId: string,
        reason: string
      ) => {
        set((state) => {
          const updateItems = (items: ChecklistItem[]) =>
            items.map((item) =>
              item.id === itemId
                ? { ...item, reason, updatedAt: new Date() }
                : item
            );

          const updatedChecklists = state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  items: updateItems(checklist.items),
                  updatedAt: new Date(),
                }
              : checklist
          );

          const updatedCurrentChecklist =
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  items: updateItems(state.currentChecklist.items),
                  updatedAt: new Date(),
                }
              : state.currentChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: updatedCurrentChecklist,
          };
        });
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
          url: imageData, // Use base64 instead of blob URL
          size: imageFile.size,
          type: imageFile.type,
        };

        set((state) => {
          const updateItems = (items: ChecklistItem[]) =>
            items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    images: [...(item.images || []), newImage],
                    updatedAt: new Date(),
                  }
                : item
            );

          const updatedChecklists = state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  items: updateItems(checklist.items),
                  updatedAt: new Date(),
                }
              : checklist
          );

          const updatedCurrentChecklist =
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  items: updateItems(state.currentChecklist.items),
                  updatedAt: new Date(),
                }
              : state.currentChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: updatedCurrentChecklist,
          };
        });
      },

      removeImageFromItem: (
        checklistId: string,
        itemId: string,
        imageId: string
      ) => {
        set((state) => {
          const updateItems = (items: ChecklistItem[]) =>
            items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    images: item.images?.filter((img) => img.id !== imageId),
                    updatedAt: new Date(),
                  }
                : item
            );

          const updatedChecklists = state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  items: updateItems(checklist.items),
                  updatedAt: new Date(),
                }
              : checklist
          );

          const updatedCurrentChecklist =
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  items: updateItems(state.currentChecklist.items),
                  updatedAt: new Date(),
                }
              : state.currentChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: updatedCurrentChecklist,
          };
        });
      },

      deleteItem: (checklistId: string, itemId: string) => {
        set((state) => {
          const updateItems = (items: ChecklistItem[]) =>
            items.filter((item) => item.id !== itemId);

          const updatedChecklists = state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  items: updateItems(checklist.items),
                  updatedAt: new Date(),
                }
              : checklist
          );

          const updatedCurrentChecklist =
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  items: updateItems(state.currentChecklist.items),
                  updatedAt: new Date(),
                }
              : state.currentChecklist;

          return {
            checklists: updatedChecklists,
            currentChecklist: updatedCurrentChecklist,
          };
        });
      },

      getChecklistProgress: (checklistId: string) => {
        const checklist = get().checklists.find(
          (list) => list.id === checklistId
        );
        if (!checklist) return { completed: 0, total: 0 };

        const completed = checklist.items.filter(
          (item) => item.status === 'completed'
        ).length;
        const total = checklist.items.length;

        return { completed, total };
      },
    }),
    {
      name: 'checklist-storage',
      partialize: (state) => ({
        checklists: state.checklists,
        currentChecklist: state.currentChecklist,
      }),
      onRehydrateStorage: () => (state) => {
        // Normalize dates when rehydrating from storage
        if (state) {
          state.checklists = state.checklists.map(normalizeChecklist);
          if (state.currentChecklist) {
            state.currentChecklist = normalizeChecklist(state.currentChecklist);
          }
        }
      },
    }
  )
);
