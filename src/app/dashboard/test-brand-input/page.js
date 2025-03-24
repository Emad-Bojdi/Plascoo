'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestBrandInput() {
  const [brandValue, setBrandValue] = useState('');
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow p-4 mb-8 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">تست فیلد ورودی برند</h1>
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            بازگشت به داشبورد
          </Link>
        </div>
      </header>

      <main className="bg-white shadow rounded-lg p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">این صفحه برای تست فیلد ورودی برند است</h2>
          <p className="text-gray-600 mb-4">
            اگر فیلد زیر یک فیلد ورودی متنی است (نه منوی کشویی)، پس مشکل اصلی در مرورگر شما یا کش است.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">فیلد ورودی برند:</h3>
          
          <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              برند (این باید یک فیلد ورودی متنی باشد)
            </label>
            <div className="relative">
              <input
                type="text"
                id="brand"
                name="brand"
                value={brandValue}
                onChange={(e) => setBrandValue(e.target.value)}
                className="w-full px-4 py-3 text-sm border-4 border-purple-500 rounded-md focus:outline-none focus:ring-4 focus:ring-purple-300 placeholder:text-gray-400 bg-purple-50"
                placeholder="هر متنی را اینجا تایپ کنید"
                autoComplete="off"
              />
              <span className="absolute inset-y-0 right-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
            <span className="text-purple-500 text-sm mt-2 block">شما تایپ کردید: {brandValue || '(خالی)'}</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                اگر همچنان به جای فیلد ورودی متنی یک منوی کشویی می‌بینید، لطفا این مراحل را انجام دهید:
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>مرورگر خود را کاملاً ببندید و دوباره باز کنید</li>
                <li>کش مرورگر را پاک کنید (Ctrl+Shift+Delete)</li>
                <li>صفحه را با Ctrl+F5 رفرش کنید</li>
                <li>از یک مرورگر دیگر استفاده کنید</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 