import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Checklist from '../../../../models/Checklist';
import { Checklist as IChecklist } from '../../../../types/checklist';

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

  const normalizeItem = (item: unknown) => {
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
      createdAt:
        typeof i.createdAt === 'string' ? new Date(i.createdAt) : i.createdAt,
      updatedAt:
        typeof i.updatedAt === 'string' ? new Date(i.updatedAt) : i.updatedAt,
    };
  };

  return {
    id: d._id || d.id || '',
    title: d.title || '',
    description: d.description,
    notes: d.notes,
    items: (d.items || []).map(normalizeItem),
    isCompleted: d.isCompleted || false,
    createdAt:
      typeof d.createdAt === 'string' ? new Date(d.createdAt) : d.createdAt,
    updatedAt:
      typeof d.updatedAt === 'string' ? new Date(d.updatedAt) : d.updatedAt,
  };
};

// GET - Tek checklist getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const checklist = await Checklist.findById(id);

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeChecklist(checklist),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Checklist getirilemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Checklist güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { title, description, notes, items, isCompleted } = body;

    const updateData: {
      updatedAt: Date;
      title?: string;
      description?: string;
      notes?: string;
      items?: IChecklist['items'];
      isCompleted?: boolean;
    } = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (notes !== undefined) updateData.notes = notes?.trim();
    if (items !== undefined) updateData.items = items;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const checklist = await Checklist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeChecklist(checklist),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Checklist güncellenemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Checklist sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const checklist = await Checklist.findByIdAndDelete(id);

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Checklist silinemedi';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
