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
  updateChecklistNotes: (checklistId: string, notes: string) => void; // New function

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
        // Default checklist items
        const defaultItems: ChecklistItem[] = [
          {
            id: crypto.randomUUID(),
            title:
              'Bina rögar kotu, pis su borularının çap ve eğim kontrolü, ofis alanlarından geçen pis su borularının ses izolasyonu yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title: 'Şantiye ilerleme durumu iş programına göre uygun mu?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Mimari/mekanik/elektrik projelerinin süperpoze kontrolünün yapıldı mı, yerleşimi etkileyen konularla ilgili kontrol onayı alındı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Saha ve çevrenin korunması/temizliği uygun mu , yapılan imalatlar ve cihazlar korunuyor mu?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Jeneratör Set alanı periyodik bakımların yapılabilmesi için yeterli  mi? Sıcak hava atışı için davlumbaz kanalı, taze hava menfezi ve egzoz gazı borusu uygun ölçülerde ve çevreye rahatsızlık vermeyecek şekilde yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Havalandırma kanal güzergahları projeye uygun mu, kanal kesit ölçüleri doğru mu?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Radyatörlerin  pe-x veya pprc hatları ile birlikte montaj yerlerinin projeye göre uygunluğu kontrol edildi mi?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Klima grubu bakır boru hatları ve cihaz montaj yerlerinin projeye göre uygunluğu kontrol edildi mi?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Klima drenaj hatları (sert PVC) yağmur gideri veya drenaj çukuruna verildi mi? Hatların klima bağlantı noktaları, eğim kontrolü ve yoğuşmaya karşı kauçuk izolasyon yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'VRV dış ünite yeri kontrol edildi mi? Dış ünite altına çelik kaide ve drenaj tavası yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Yangın branşman hatları (galvanizli ya da siyah çelik boru) projeye göre uygun çap ve güzergahta yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Tesisat alt yapı test edildi mi (basınç değeri 4 bar)? Geçici kabul öncesi tüm sistemlerin test, ölçüm ve raporlamaları yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Kazan ve ekipmanlarının montajı,  kazan baca güzergahı ve  kazan dairesi havalandırması uygun yapıldı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Doğalgaz projesi  çalışmaları başlatıldı mı? Doğalgaz kolon ve iç tesisat hatları çeklidi mi?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title: 'Doğalgaz projesi onaylatıldı mı? Kazan devreye alındı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Yangın dolapları ,İtfaiye bağlantı ağızları ve varsa yangın sprinklerinin montajı uygun yapıldı mı? Sprink koruma plastik kapakları sökülerek sistem devreye alındı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title:
              'Cihaz ve radyatör montajı için duvar kağıdı yapılacak alanlar kontrol edildi mi, montaj öncesi kağıt imalatları tamamlandı mı?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          {
            id: crypto.randomUUID(),
            title:
              'Kullanılan ürünlerin/cihazların  marka-modeli banka şartnamesine ve projeye uygun mu? Ürünler/Cihazlar çalışır halde teslim edildi mi?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: crypto.randomUUID(),
            title: 'Varsa Projede yapılan revizyonlar kontrol edildi mi?',
            description: '',
            status: 'not-started',
            images: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const newChecklist: Checklist = {
          id: crypto.randomUUID(),
          title,
          description,
          items: defaultItems,
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

      updateChecklistNotes: (checklistId: string, notes: string) => {
        set((state) => ({
          checklists: state.checklists.map((checklist) =>
            checklist.id === checklistId
              ? {
                  ...checklist,
                  notes,
                  updatedAt: new Date(),
                }
              : checklist
          ),
          currentChecklist:
            state.currentChecklist?.id === checklistId
              ? {
                  ...state.currentChecklist,
                  notes,
                  updatedAt: new Date(),
                }
              : state.currentChecklist,
        }));
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
