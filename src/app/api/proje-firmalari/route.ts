import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import ProjeFirmasi from '../../../models/ProjeFirmasi';

// GET - Tüm proje firmalarını getir
export async function GET() {
  try {
    await connectDB();
    const firmalar = await ProjeFirmasi.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: firmalar });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Firmalar getirilemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni proje firması ekle
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Firma adı gereklidir' },
        { status: 400 }
      );
    }

    const firma = await ProjeFirmasi.create({
      name: name.trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, data: firma }, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Firma eklenemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
