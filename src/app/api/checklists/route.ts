import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import connectDB from '../../../lib/mongodb';
import Checklist from '../../../models/Checklist';
import {
  Checklist as IChecklist,
  ChecklistItem,
} from '../../../types/checklist';

// Helper to normalize checklist data from API
const normalizeChecklist = (data: unknown): IChecklist => {
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
      images: (i.images || []) as IChecklist['items'][0]['images'],
      createdAt: typeof i.createdAt === 'string' ? new Date(i.createdAt) : i.createdAt,
      updatedAt: typeof i.updatedAt === 'string' ? new Date(i.updatedAt) : i.updatedAt,
    };
  };

  return {
    id: d._id || d.id || '',
    title: d.title || '',
    description: d.description,
    notes: d.notes,
    items: (d.items || []).map(normalizeItem),
    isCompleted: d.isCompleted || false,
    createdAt: typeof d.createdAt === 'string' ? new Date(d.createdAt) : d.createdAt,
    updatedAt: typeof d.updatedAt === 'string' ? new Date(d.updatedAt) : d.updatedAt,
  };
};

// GET - Tüm checklist'leri getir
export async function GET() {
  try {
    await connectDB();
    const checklists = await Checklist.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: checklists.map(normalizeChecklist),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Checklist\'ler getirilemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Yeni checklist oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, description, items } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Checklist başlığı gereklidir' },
        { status: 400 }
      );
    }

    // Default items if not provided
    const defaultItems: ChecklistItem[] = [
      {
        id: randomUUID(),
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
      {
        id: crypto.randomUUID(),
        title: 'Su Deposu Kontrolü',
        description: 'Su Deposu Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Flatör Kontrolü',
        description: '',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Sayaç Grubu Kontrolü',
        description: 'Sayaç Grubu Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Termosifon Kontrolü',
        description: 'Termosifon Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Mutfak Batarya Kontrolü',
        description: 'Mutfak Batarya Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'WC Batarya Kontrolü',
        description: 'WC Batarya Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Hidrofor Kontrolü',
        description: 'Hidrofor Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Pis Su Boruları Kontrolü',
        description: 'Pis Su Boruları Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Yer Süzgeci Kontrolü',
        description: 'Yer Süzgeci Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Dalgıç Pompa Kontrolü',
        description: 'Dalgıç Pompa Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Lavabo/Eviye Kontrolü',
        description: 'Lavabo/Eviye Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Atık Su İstasyonu Kontrolü',
        description: 'Atık Su İstasyonu Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Vitrifiye Malzemesi Kontrolü',
        description: 'Vitrifiye Malzemesi Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Yangın Suyu Deposu Kontrolü',
        description: 'Yangın Suyu Deposu Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Yangın Pompası Kontrolü',
        description: 'Yangın Pompası Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Yangın Dolabı Kontrolü',
        description: 'Yangın Dolabı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Isıtma Tesisatı Kontrolü',
        description: 'Isıtma Tesisatı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Radyatör Kontrolü',
        description: 'Radyatör Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Kazan Tesisatı Kontrolü',
        description: 'Kazan Tesisatı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Doğalgaz Tesisatı Kontrolü',
        description: 'Doğalgaz Tesisatı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Havalandırma Kanalı Kontrolü',
        description: 'Havalandırma Kanalı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Fan Kontrolü',
        description: 'Fan Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Hava Fleksi Kontrolü',
        description: 'Hava Fleksi Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Klima Kanalı Kontrolü',
        description: 'Klima Kanalları İzolasyonlu Olacak',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Menfez Kontrolü',
        description: 'Menfez Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Aspiratör Kontrolü',
        description: 'Aspiratör Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'IGK Cihazı Kontrolü',
        description: 'IGK Cihazı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'VRV Kumanda Kontrolü',
        description: 'Operasyon odasında olacak',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Kazan Termostat Kontrolü',
        description: 'Operasyon Odasında olacak',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Hava Perdesi Kontrolü',
        description: 'Hava Perdesi Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Vasistas Motoru Kontrolü',
        description: 'Kablolu Kumanda Olacak',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: 'Müdahale Kapağı Kontrolü',
        description: 'Müdahale Kapağı Kontrolü',
        status: 'not-started',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Use provided items or default items
    const checklistItems = items || defaultItems;

    const checklist = await Checklist.create({
      title: title.trim(),
      description: description?.trim(),
      items: checklistItems,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, data: normalizeChecklist(checklist) },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Checklist oluşturulamadı';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

