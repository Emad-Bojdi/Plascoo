'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold mb-2">سامانه مدیریت محصولات</h3>
            <p className="text-sm text-gray-300">
              سیستم مدیریت قیمت‌های عمده و تکی
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex space-x-4 space-x-reverse mb-2">
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                درباره ما
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                تماس با ما
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">
                حریم خصوصی
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © {currentYear} تمامی حقوق محفوظ است
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 