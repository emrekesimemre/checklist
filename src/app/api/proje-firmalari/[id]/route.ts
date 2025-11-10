import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import ProjeFirmasi from '../../../../models/ProjeFirmasi';

// PUT - Proje firması güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Firma adı gereklidir' },
        { status: 400 }
      );
    }

    const firma = await ProjeFirmasi.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!firma) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: firma });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Firma güncellenemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Proje firması sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const firma = await ProjeFirmasi.findByIdAndDelete(id);

    if (!firma) {
      return NextResponse.json(
        { success: false, error: 'Firma bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Firma silinemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
