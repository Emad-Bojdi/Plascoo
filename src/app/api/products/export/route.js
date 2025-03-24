import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import ExcelJS from 'exceljs';
import connectDB from '@/app/lib/db';
import Product from '@/app/models/Product';
import { authOptions } from '../../auth/[...nextauth]/route';

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
    
    // ساخت فیلتر جستجو
    const filter = {};
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    if (brand) {
      filter.brand = brand;
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
    
    // ایجاد فایل اکسل
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Plasco Management System';
    workbook.created = new Date();
    
    // ایجاد یک صفحه جدید در فایل اکسل
    const worksheet = workbook.addWorksheet('محصولات');
    
    // اضافه کردن هدر ستون‌ها
    worksheet.columns = [
      { header: 'نام محصول', key: 'name', width: 30 },
      { header: 'برند', key: 'brand', width: 20 },
      { header: 'کد محصول (SKU)', key: 'sku', width: 15 },
      { header: 'قیمت تکی (تومان)', key: 'retailPrice', width: 15 },
      { header: 'قیمت عمده (تومان)', key: 'wholesalePrice', width: 15 },
      { header: 'تاریخ ایجاد', key: 'createdAt', width: 20 },
    ];
    
    // اضافه کردن داده محصولات
    products.forEach(product => {
      worksheet.addRow({
        name: product.name,
        brand: product.brand || 'متفرقه',
        sku: product.sku || '---',
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        createdAt: product.createdAt ? new Date(product.createdAt).toLocaleDateString('fa-IR') : '---',
      });
    });
    
    // استایل دهی به هدر ستون‌ها
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'right' };
    
    // استایل دهی به سلول‌ها - تراز راست برای تمامی سلول‌ها
    worksheet.eachRow((row, rowNumber) => {
      row.alignment = { horizontal: 'right' };
      
      // فرمت سلول‌های قیمت
      if (rowNumber > 1) {
        row.getCell('retailPrice').numFmt = '#,##0';
        row.getCell('wholesalePrice').numFmt = '#,##0';
      }
    });
    
    // ایجاد باینری فایل اکسل
    const buffer = await workbook.xlsx.writeBuffer();
    
    // ارسال پاسخ به صورت فایل قابل دانلود
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="plasco-products-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
    
  } catch (error) {
    console.error('Error exporting products to Excel:', error);
    return NextResponse.json(
      { message: 'خطا در خروجی گرفتن از محصولات' },
      { status: 500 }
    );
  }
}