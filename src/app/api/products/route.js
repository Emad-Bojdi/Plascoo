import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db';
import Product from '@/app/models/Product';
import { authOptions } from '../auth/[...nextauth]/route';

// دریافت همه محصولات با قابلیت جستجو
export async function GET(request) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'احراز هویت ناموفق' },
        { status: 401 }
      );
    }
    
    // دریافت پارامترهای جستجو از URL
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sku = searchParams.get('sku');
    
    // ساخت فیلتر جستجو
    const filter = {};
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    
    if (sku) {
      filter.sku = { $regex: sku, $options: 'i' };
    }
    
    // فیلتر قیمت
    if (minPrice || maxPrice) {
      filter.retailPrice = {};
      
      if (minPrice) {
        filter.retailPrice.$gte = parseFloat(minPrice);
      }
      
      if (maxPrice) {
        filter.retailPrice.$lte = parseFloat(maxPrice);
      }
    }
    
    // اتصال به دیتابیس
    await connectDB();
    
    // دریافت محصولات با فیلتر
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ products });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت محصولات' },
      { status: 500 }
    );
  }
}

// ایجاد محصول جدید
export async function POST(request) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'احراز هویت ناموفق' },
        { status: 401 }
      );
    }
    
    // دریافت داده‌های محصول از درخواست
    const { name, retailPrice, wholesalePrice, brand, sku } = await request.json();
    
    // اتصال به دیتابیس
    await connectDB();
    
    // بررسی تکراری نبودن SKU اگر ارائه شده باشد
    
    // ایجاد محصول جدید
    const product = await Product.create({
      name,
      retailPrice,
      wholesalePrice,
      brand,
      sku: sku ? sku : undefined,
      createdBy: session.user.id,
    });
    
    return NextResponse.json({ 
      message: 'محصول با موفقیت ایجاد شد', 
      product 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // اگر خطا خاصی مربوط به اعتبارسنجی مدل مونگو باشد
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'خطا در ایجاد محصول' },
      { status: 500 }
    );
  }
} 
