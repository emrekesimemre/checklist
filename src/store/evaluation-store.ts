import { create } from 'zustand';
import { ProjeFirmasi, Konu, Degerlendirme, Puan } from '../types/evaluation';

interface EvaluationStore {
  // Data
  projeFirmalari: ProjeFirmasi[];
  konular: Konu[];
  degerlendirmeler: Degerlendirme[];
  loading: boolean;
  loadingProjeFirmalari: boolean;
  loadingKonular: boolean;
  loadingDegerlendirmeler: boolean;
  error: string | null;

  // Proje Firması Actions
  fetchProjeFirmalari: () => Promise<void>;
  addProjeFirmasi: (name: string) => Promise<void>;
  updateProjeFirmasi: (id: string, name: string) => Promise<void>;
  deleteProjeFirmasi: (id: string) => Promise<void>;

  // Konu Actions
  fetchKonular: () => Promise<void>;
  addKonu: (title: string) => Promise<void>;
  updateKonu: (id: string, title: string) => Promise<void>;
  deleteKonu: (id: string) => Promise<void>;
  reorderKonular: (konuIds: string[]) => Promise<void>;

  // Değerlendirme Actions
  fetchDegerlendirmeler: (
    yil?: number,
    firmaId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  createDegerlendirme: (
    isAdi: string,
    projeFirmasiId: string,
    puanlar: Puan[],
    notlar?: string
  ) => Promise<void>;
  updateDegerlendirme: (
    id: string,
    isAdi?: string,
    projeFirmasiId?: string,
    puanlar?: Puan[],
    notlar?: string
  ) => Promise<void>;
  deleteDegerlendirme: (id: string) => Promise<void>;

  // Utility
  getDegerlendirmelerByFirma: (firmaId: string) => Degerlendirme[];
  getDegerlendirmelerByYil: (yil: number) => Degerlendirme[];
  getFirmaPuanlariByYil: (yil: number) => {
    firmaId: string;
    firmaName: string;
    ortalamaPuan: number;
    degerlendirmeSayisi: number;
  }[];
}

// Helper function to ensure dates are Date objects
const ensureDate = (date: Date | string): Date => {
  return typeof date === 'string' ? new Date(date) : date;
};

// Helper to normalize data from API
const normalizeProjeFirmasi = (data: unknown): ProjeFirmasi => {
  const d = data as {
    _id?: string;
    id?: string;
    name: string;
    createdAt: Date | string;
  };
  return {
    id: d._id || d.id || '',
    name: d.name || '',
    createdAt: ensureDate(d.createdAt),
  };
};

const normalizeKonu = (data: unknown): Konu => {
  const d = data as {
    _id?: string;
    id?: string;
    title: string;
    order?: number;
    createdAt: Date | string;
  };
  return {
    id: d._id || d.id || '',
    title: d.title || '',
    order: d.order || 0,
    createdAt: ensureDate(d.createdAt),
  };
};

const normalizeDegerlendirme = (data: unknown): Degerlendirme => {
  const d = data as {
    _id?: string;
    id?: string;
    isAdi: string;
    projeFirmasiId: string;
    projeFirmasiName: string;
    puanlar?: Puan[];
    toplamPuan?: number;
    notlar?: string;
    yil?: number;
    createdAt: Date | string;
    updatedAt?: Date | string;
  };
  return {
    id: d._id || d.id || '',
    isAdi: d.isAdi || '',
    projeFirmasiId: d.projeFirmasiId || '',
    projeFirmasiName: d.projeFirmasiName || '',
    puanlar: d.puanlar || [],
    toplamPuan: d.toplamPuan || 0,
    notlar: d.notlar,
    yil: d.yil || new Date().getFullYear(),
    createdAt: ensureDate(d.createdAt),
    updatedAt: ensureDate(d.updatedAt || d.createdAt),
  };
};

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  projeFirmalari: [],
  konular: [],
  degerlendirmeler: [],
  loading: false,
  loadingProjeFirmalari: false,
  loadingKonular: false,
  loadingDegerlendirmeler: false,
  error: null,

  // Proje Firması Actions
  fetchProjeFirmalari: async () => {
    set({ loading: true, loadingProjeFirmalari: true, error: null });
    try {
      const response = await fetch('/api/proje-firmalari');
      const result = await response.json();
      if (result.success) {
        set({
          projeFirmalari: result.data.map(normalizeProjeFirmasi),
          loading: false,
          loadingProjeFirmalari: false,
        });
      } else {
        set({
          error: result.error,
          loading: false,
          loadingProjeFirmalari: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Firmalar getirilemedi';
      set({
        error: errorMessage,
        loading: false,
        loadingProjeFirmalari: false,
      });
    }
  },

  addProjeFirmasi: async (name: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/proje-firmalari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (result.success) {
        const newFirma = normalizeProjeFirmasi(result.data);
        set((state) => ({
          projeFirmalari: [...state.projeFirmalari, newFirma],
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Firma eklenemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateProjeFirmasi: async (id: string, name: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/proje-firmalari/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (result.success) {
        const updatedFirma = normalizeProjeFirmasi(result.data);
        set((state) => ({
          projeFirmalari: state.projeFirmalari.map((f) =>
            f.id === id ? updatedFirma : f
          ),
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Firma güncellenemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteProjeFirmasi: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/proje-firmalari/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          projeFirmalari: state.projeFirmalari.filter((f) => f.id !== id),
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Firma silinemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Konu Actions
  fetchKonular: async () => {
    set({ loading: true, loadingKonular: true, error: null });
    try {
      const response = await fetch('/api/konular');
      const result = await response.json();
      if (result.success) {
        set({
          konular: result.data.map(normalizeKonu),
          loading: false,
          loadingKonular: false,
        });
      } else {
        set({ error: result.error, loading: false, loadingKonular: false });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Konular getirilemedi';
      set({ error: errorMessage, loading: false, loadingKonular: false });
    }
  },

  addKonu: async (title: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/konular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const result = await response.json();
      if (result.success) {
        const newKonu = normalizeKonu(result.data);
        set((state) => ({
          konular: [...state.konular, newKonu],
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Konu eklenemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateKonu: async (id: string, title: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/konular/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const result = await response.json();
      if (result.success) {
        const updatedKonu = normalizeKonu(result.data);
        set((state) => ({
          konular: state.konular.map((k) => (k.id === id ? updatedKonu : k)),
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Konu güncellenemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteKonu: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/konular/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          konular: state.konular.filter((k) => k.id !== id),
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Konu silinemedi';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  reorderKonular: async (konuIds: string[]) => {
    // Bu özellik için API endpoint'i eklenebilir, şimdilik sadece local state'i güncelle
    set((state) => {
      const konuMap = new Map(state.konular.map((k) => [k.id, k]));
      const reordered = konuIds
        .map((id, index) => {
          const konu = konuMap.get(id);
          return konu ? { ...konu, order: index } : null;
        })
        .filter((k): k is Konu => k !== null);

      const existingIds = new Set(konuIds);
      const missing = state.konular.filter((k) => !existingIds.has(k.id));
      return {
        konular: [...reordered, ...missing],
      };
    });
  },

  // Değerlendirme Actions
  fetchDegerlendirmeler: async (
    yil?: number,
    firmaId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    set({ loading: true, loadingDegerlendirmeler: true, error: null });
    try {
      const params = new URLSearchParams();
      if (yil) params.append('yil', yil.toString());
      if (firmaId) params.append('firmaId', firmaId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `/api/degerlendirmeler${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        set({
          degerlendirmeler: result.data.map(normalizeDegerlendirme),
          loading: false,
          loadingDegerlendirmeler: false,
        });
      } else {
        set({
          error: result.error,
          loading: false,
          loadingDegerlendirmeler: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Değerlendirmeler getirilemedi';
      set({
        error: errorMessage,
        loading: false,
        loadingDegerlendirmeler: false,
      });
    }
  },

  createDegerlendirme: async (
    isAdi: string,
    projeFirmasiId: string,
    puanlar: Puan[],
    notlar?: string
  ) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const firma = state.projeFirmalari.find((f) => f.id === projeFirmasiId);
      if (!firma) {
        throw new Error('Proje firması bulunamadı');
      }

      const response = await fetch('/api/degerlendirmeler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAdi,
          projeFirmasiId,
          projeFirmasiName: firma.name,
          puanlar,
          notlar,
        }),
      });
      const result = await response.json();
      if (result.success) {
        const newDegerlendirme = normalizeDegerlendirme(result.data);
        set((state) => ({
          degerlendirmeler: [newDegerlendirme, ...state.degerlendirmeler],
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Değerlendirme eklenemedi';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  updateDegerlendirme: async (
    id: string,
    isAdi?: string,
    projeFirmasiId?: string,
    puanlar?: Puan[],
    notlar?: string
  ) => {
    set({ loading: true, error: null });
    try {
      const state = get();
      let projeFirmasiName: string | undefined;
      if (projeFirmasiId) {
        const firma = state.projeFirmalari.find((f) => f.id === projeFirmasiId);
        if (firma) projeFirmasiName = firma.name;
      }

      const body: {
        isAdi?: string;
        projeFirmasiId?: string;
        projeFirmasiName?: string;
        puanlar?: Puan[];
        notlar?: string;
      } = {};
      if (isAdi !== undefined) body.isAdi = isAdi;
      if (projeFirmasiId !== undefined) body.projeFirmasiId = projeFirmasiId;
      if (projeFirmasiName !== undefined)
        body.projeFirmasiName = projeFirmasiName;
      if (puanlar !== undefined) body.puanlar = puanlar;
      if (notlar !== undefined) body.notlar = notlar;

      const response = await fetch(`/api/degerlendirmeler/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        const updatedDegerlendirme = normalizeDegerlendirme(result.data);
        set((state) => ({
          degerlendirmeler: state.degerlendirmeler.map((d) =>
            d.id === id ? updatedDegerlendirme : d
          ),
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Değerlendirme güncellenemedi';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  deleteDegerlendirme: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/degerlendirmeler/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        set((state) => ({
          degerlendirmeler: state.degerlendirmeler.filter((d) => d.id !== id),
          loading: false,
        }));
      } else {
        set({ error: result.error, loading: false });
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Değerlendirme silinemedi';
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  // Utility Functions
  getDegerlendirmelerByFirma: (firmaId: string) => {
    return get().degerlendirmeler.filter((d) => d.projeFirmasiId === firmaId);
  },

  getDegerlendirmelerByYil: (yil: number) => {
    return get().degerlendirmeler.filter((d) => d.yil === yil);
  },

  getFirmaPuanlariByYil: (yil: number) => {
    const degerlendirmeler = get().getDegerlendirmelerByYil(yil);
    const firmaMap = new Map<
      string,
      { name: string; puanlar: number[]; count: number }
    >();

    degerlendirmeler.forEach((d) => {
      const existing = firmaMap.get(d.projeFirmasiId);
      if (existing) {
        existing.puanlar.push(d.toplamPuan);
        existing.count++;
      } else {
        firmaMap.set(d.projeFirmasiId, {
          name: d.projeFirmasiName,
          puanlar: [d.toplamPuan],
          count: 1,
        });
      }
    });

    return Array.from(firmaMap.entries())
      .map(([firmaId, data]) => ({
        firmaId,
        firmaName: data.name,
        ortalamaPuan:
          data.puanlar.reduce((sum, p) => sum + p, 0) / data.puanlar.length,
        degerlendirmeSayisi: data.count,
      }))
      .sort((a, b) => b.ortalamaPuan - a.ortalamaPuan);
  },
}));
