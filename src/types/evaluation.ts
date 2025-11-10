// Proje Firması
export interface ProjeFirmasi {
  id: string;
  name: string;
  createdAt: Date;
}

// Değerlendirme Konusu
export interface Konu {
  id: string;
  title: string;
  order: number; // Sıralama için
  createdAt: Date;
}

// Değerlendirme Puanı (0-10 arası)
export interface Puan {
  konuId: string;
  puan: number; // 0-10 arası
}

// Tek bir değerlendirme
export interface Degerlendirme {
  id: string;
  isAdi: string; // İşin adı
  projeFirmasiId: string;
  projeFirmasiName: string; // Denormalize edilmiş, raporlama için
  puanlar: Puan[]; // Her konu için puan
  toplamPuan: number; // Hesaplanmış toplam puan
  notlar?: string; // Genel notlar
  createdAt: Date;
  updatedAt: Date;
  yil: number; // Raporlama için yıl bilgisi
}

