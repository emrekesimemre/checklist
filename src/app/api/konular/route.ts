import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Konu from '../../../models/Konu';

// GET - Tüm konuları getir
export async function GET() {
  try {
    await connectDB();
    const konular = await Konu.find({}).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ success: true, data: konular });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Konular getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni konu ekle
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Konu başlığı gereklidir' },
        { status: 400 }
      );
    }

    // Mevcut konu sayısını al (order için)
    const konuCount = await Konu.countDocuments();
    const konu = await Konu.create({
      title: title.trim(),
      order: konuCount,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, data: konu }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Konu eklenemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
