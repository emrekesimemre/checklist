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

