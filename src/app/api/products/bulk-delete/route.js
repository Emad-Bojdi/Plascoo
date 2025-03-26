import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db';
import Product from '@/app/models/Product';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(request) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'احراز هویت ناموفق' },
        { status: 401 }
      );
    }
    
    // دریافت لیست شناسه‌های محصولات
    const { productIds } = await request.json();
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { message: 'لیست محصولات نامعتبر است' },
        { status: 400 }
      );
    }
    
    // اتصال به دیتابیس
    await connectDB();
    
    // حذف محصولات
    const result = await Product.deleteMany({
      _id: { $in: productIds }
    });
    
    return NextResponse.json({
      message: `${result.deletedCount} محصول با موفقیت حذف شد`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json(
      { message: 'خطا در حذف محصولات' },
      { status: 500 }
    );
  }
} 