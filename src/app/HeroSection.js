'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="bg-blue-600 text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">مدیریت موجودی محصول</h1>
          <p className="text-xl mb-8">
            سیستم مدیریت موجودی محصول با امکان ردیابی، اضافه کردن و ویرایش محصولات
          </p>
          <div className="space-x-4 space-x-reverse">
            <Link href="/products" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg inline-block">
              مشاهده محصولات
            </Link>
            <Link href="/auth/signin" className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-medium text-lg inline-block">
              ورود به سیستم
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 