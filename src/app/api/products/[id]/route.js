import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db';
import Product from '@/app/models/Product';

// دریافت یک محصول خاص
export async function GET(request, { params }) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'احراز هویت ناموفق' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // اتصال به دیتابیس
    await connectDB();
    
    // یافتن محصول مورد نظر
    const product = await Product.findOne({ 
      _id: id, 
      createdBy: session.user.id 
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'خطا در دریافت محصول' },
      { status: 500 }
    );
  }
}

// به‌روزرسانی یک محصول خاص
export async function PUT(request, { params }) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'احراز هویت ناموفق' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // دریافت داده‌های محصول از درخواست
    const { name, retailPrice, wholesalePrice, brand, sku } = await request.json();
    
    // اتصال به دیتابیس
    await connectDB();
    
    // یافتن محصول مورد نظر
    let product = await Product.findOne({ 
      _id: id, 
      createdBy: session.user.id 
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }
    
    // بررسی تکراری نبودن SKU اگر تغییر کرده باشد
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct && existingProduct._id.toString() !== id) {
        return NextResponse.json(
          { message: 'محصولی با این کد محصول (SKU) قبلاً ثبت شده است' },
          { status: 400 }
        );
      }
    }
    
    // به‌روزرسانی محصول
    product.name = name;
    product.retailPrice = retailPrice;
    product.wholesalePrice = wholesalePrice;
    product.brand = brand;
    if (sku) product.sku = sku;
    
    await product.save();
    
    return NextResponse.json({ 
      message: 'محصول با موفقیت به‌روزرسانی شد', 
      product 
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    
    // اگر خطا خاصی مربوط به اعتبارسنجی مدل مونگو باشد
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { message: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'خطا در به‌روزرسانی محصول' },
      { status: 500 }
    );
  }
}

// حذف یک محصول خاص
export async function DELETE(request, { params }) {
  try {
    // بررسی احراز هویت
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'احراز هویت ناموفق' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // اتصال به دیتابیس
    await connectDB();
    
    // یافتن و حذف محصول مورد نظر
    const product = await Product.findOneAndDelete({ 
      _id: id, 
      createdBy: session.user.id 
    });
    
    if (!product) {
      return NextResponse.json(
        { message: 'محصول یافت نشد' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'محصول با موفقیت حذف شد'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'خطا در حذف محصول' },
      { status: 500 }
    );
  }
} 