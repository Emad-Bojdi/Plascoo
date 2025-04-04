import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Toy from '@/app/models/Toy';

// دریافت لیست اسباب بازی‌ها
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  
  try {
    // ساخت فیلتر جستجو
    const filter = {};
    
    // اضافه کردن فیلترهای جستجو
    if (searchParams.has('name')) {
      filter.name = { $regex: searchParams.get('name'), $options: 'i' };
    }
    
    if (searchParams.has('brand')) {
      filter.brand = { $regex: searchParams.get('brand'), $options: 'i' };
    }
    
    if (searchParams.has('sku')) {
      filter.sku = { $regex: searchParams.get('sku'), $options: 'i' };
    }
    
    
    
    // فیلتر محدوده قیمت
    if (searchParams.has('minPrice')) {
      filter.retailPrice = { 
        ...filter.retailPrice, 
        $gte: Number(searchParams.get('minPrice')) 
      };
    }
    
    if (searchParams.has('maxPrice')) {
      filter.retailPrice = { 
        ...filter.retailPrice,
        $lte: Number(searchParams.get('maxPrice')) 
      };
    }
    
    // فیلتر موجودی
    if (searchParams.has('inStock')) {
      filter.stockQuantity = { $gt: 0 };
    }
    
    // دریافت اسباب بازی‌ها با فیلترهای مشخص شده
    const toys = await Toy.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ toys }, { status: 200 });
  } catch (error) {
    console.error('Error fetching toys:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت اسباب بازی‌ها' },
      { status: 500 }
    );
  }
}

// افزودن اسباب بازی جدید
export async function POST(request) {
  await connectDB();
  
  try {
    const data = await request.json();
    const newToy = new Toy(data);
    await newToy.save();
    
    return NextResponse.json(
      { message: 'اسباب بازی با موفقیت ثبت شد', toy: newToy },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating toy:', error);
    
    // اگر خطا خاصی مربوط به اعتبارسنجی مدل مونگو باشد
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'خطا در ایجاد اسباب بازی' },
      { status: 500 }
    );
  }
} 