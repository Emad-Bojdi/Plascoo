import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Toy from '@/app/models/Toy';

// حذف گروهی اسباب بازی‌ها
export async function DELETE(request) {
  await connectDB();
  
  try {
    const { toyIds } = await request.json();
    
    if (!toyIds || !Array.isArray(toyIds) || toyIds.length === 0) {
      return NextResponse.json(
        { message: 'آیدی اسباب بازی‌ها برای حذف مشخص نشده است' },
        { status: 400 }
      );
    }
    
    const result = await Toy.deleteMany({ _id: { $in: toyIds } });
    
    return NextResponse.json(
      { 
        message: `${result.deletedCount} اسباب بازی با موفقیت حذف شدند`,
        deletedCount: result.deletedCount 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error bulk deleting toys:', error);
    return NextResponse.json(
      { message: 'خطا در حذف گروهی اسباب بازی‌ها' },
      { status: 500 }
    );
  }
} 