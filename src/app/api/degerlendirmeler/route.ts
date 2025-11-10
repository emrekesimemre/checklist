import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Degerlendirme from '../../../models/Degerlendirme';
import { Puan } from '../../../types/evaluation';

// GET - Tüm değerlendirmeleri getir (opsiyonel query parametreleri ile filtreleme)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const yil = searchParams.get('yil');
    const firmaId = searchParams.get('firmaId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: {
      yil?: number;
      projeFirmasiId?: string;
      createdAt?: {
        $gte?: Date;
        $lte?: Date;
      };
    } = {};
    if (yil) {
      query.yil = parseInt(yil);
    }
    if (firmaId) {
      query.projeFirmasiId = firmaId;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // End date'in sonuna kadar (23:59:59.999) dahil etmek için
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const degerlendirmeler = await Degerlendirme.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, data: degerlendirmeler });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Değerlendirmeler getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni değerlendirme ekle
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { isAdi, projeFirmasiId, projeFirmasiName, puanlar, notlar } = body;

    if (!isAdi || !isAdi.trim()) {
      return NextResponse.json(
        { success: false, error: 'İş adı gereklidir' },
        { status: 400 }
      );
    }

    if (!projeFirmasiId) {
      return NextResponse.json(
        { success: false, error: 'Proje firması gereklidir' },
        { status: 400 }
      );
    }

    if (!projeFirmasiName) {
      return NextResponse.json(
        { success: false, error: 'Proje firması adı gereklidir' },
        { status: 400 }
      );
    }

    if (!puanlar || !Array.isArray(puanlar)) {
      return NextResponse.json(
        { success: false, error: 'Puanlar gereklidir' },
        { status: 400 }
      );
    }

    // Toplam puanı hesapla
    const toplamPuan =
      puanlar.length > 0
        ? puanlar.reduce((sum: number, p: Puan) => sum + p.puan, 0) /
          puanlar.length
        : 0;

    // Yıl bilgisini al
    const yil = new Date().getFullYear();

    const degerlendirme = await Degerlendirme.create({
      isAdi: isAdi.trim(),
      projeFirmasiId,
      projeFirmasiName: projeFirmasiName.trim(),
      puanlar,
      toplamPuan,
      notlar: notlar?.trim() || undefined,
      yil,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, data: degerlendirme },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Değerlendirme eklenemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
