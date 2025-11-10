import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Degerlendirme from '../../../../models/Degerlendirme';
import { Puan } from '../../../../types/evaluation';

// PUT - Değerlendirme güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { isAdi, projeFirmasiId, projeFirmasiName, puanlar, notlar } = body;

    const updateData: {
      updatedAt: Date;
      isAdi?: string;
      projeFirmasiId?: string;
      projeFirmasiName?: string;
      puanlar?: Puan[];
      toplamPuan?: number;
      notlar?: string;
    } = {
      updatedAt: new Date(),
    };

    if (isAdi !== undefined) {
      updateData.isAdi = isAdi.trim();
    }
    if (projeFirmasiId !== undefined) {
      updateData.projeFirmasiId = projeFirmasiId;
    }
    if (projeFirmasiName !== undefined) {
      updateData.projeFirmasiName = projeFirmasiName.trim();
    }
    if (puanlar !== undefined) {
      updateData.puanlar = puanlar;
      // Toplam puanı yeniden hesapla
      updateData.toplamPuan =
        puanlar.length > 0
          ? puanlar.reduce((sum: number, p: Puan) => sum + p.puan, 0) /
            puanlar.length
          : 0;
    }
    if (notlar !== undefined) {
      updateData.notlar = notlar?.trim() || undefined;
    }

    const degerlendirme = await Degerlendirme.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!degerlendirme) {
      return NextResponse.json(
        { success: false, error: 'Değerlendirme bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: degerlendirme });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Değerlendirme güncellenemedi';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// DELETE - Değerlendirme sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const degerlendirme = await Degerlendirme.findByIdAndDelete(id);

    if (!degerlendirme) {
      return NextResponse.json(
        { success: false, error: 'Değerlendirme bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Değerlendirme silinemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
