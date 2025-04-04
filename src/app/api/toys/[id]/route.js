import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Toy from '@/app/models/Toy';

// دریافت اسباب بازی با آیدی مشخص
export async function GET(request, { params }) {
  await connectDB();
  
  try {
    const toy = await Toy.findById(params.id);
    
    if (!toy) {
      return NextResponse.json(
        { message: 'اسباب بازی یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ toy }, { status: 200 });
  } catch (error) {
    console.error('Error fetching toy:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت اسباب بازی' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی اسباب بازی
export async function PUT(request, { params }) {
  await connectDB();
  
  try {
    const data = await request.json();
    
    const updatedToy = await Toy.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedToy) {
      return NextResponse.json(
        { message: 'اسباب بازی یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'اسباب بازی با موفقیت به‌روزرسانی شد', toy: updatedToy },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating toy:', error);
    
    // اگر خطا خاصی مربوط به اعتبارسنجی مدل مونگو باشد
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'خطا در به‌روزرسانی اسباب بازی' },
      { status: 500 }
    );
  }
}

// حذف اسباب بازی
export async function DELETE(request, { params }) {
  await connectDB();
  
  try {
    const deletedToy = await Toy.findByIdAndDelete(params.id);
    
    if (!deletedToy) {
      return NextResponse.json(
        { message: 'اسباب بازی یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'اسباب بازی با موفقیت حذف شد' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting toy:', error);
    return NextResponse.json(
      { message: 'خطا در حذف اسباب بازی' },
      { status: 500 }
    );
  }
} 