'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProduct() {
  const [formData, setFormData] = useState({
    name: '',
    retailPrice: '',
    wholesalePrice: '',
    brand: 'متفرقه',
    sku: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // تبدیل قیمت‌ها به عدد
    const productData = {
      ...formData,
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
    };
    
    // بررسی صحت ورودی‌ها
    if (!productData.name || isNaN(productData.retailPrice)) {
      setError('لطفا تمام فیلدهای ضروری را پر کنید');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'خطایی در ثبت محصول رخ داده است');
      }
      
      // در صورت موفقیت، هدایت به صفحه داشبورد
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">افزودن محصول جدید</h1>
            <Link href="/dashboard" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white text-xs sm:text-sm rounded-md hover:bg-gray-600 w-full sm:w-auto text-center">
              بازگشت به داشبورد
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            {error && (
              <div className="bg-red-100 p-3 sm:p-4 mb-4 sm:mb-6 rounded-md text-xs sm:text-sm text-red-700">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700">
                  نام محصول <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500 placeholder:text-gray-400"
                  placeholder="نام محصول را وارد کنید"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="retailPrice" className="block text-xs sm:text-sm font-medium text-gray-700">
                    قیمت تکی (تومان) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="retailPrice"
                    name="retailPrice"
                    type="number"
                    required
                    value={formData.retailPrice}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500 placeholder:text-gray-400"
                    placeholder="قیمت تکی را وارد کنید"
                    min="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="wholesalePrice" className="block text-xs sm:text-sm font-medium text-gray-700">
                    قیمت عمده (تومان) 
                  </label>
                  <input
                    id="wholesalePrice"
                    name="wholesalePrice"
                    type="number"
                    value={formData.wholesalePrice}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500 placeholder:text-gray-400"
                    placeholder="قیمت عمده را وارد کنید"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="brand" className="block text-xs sm:text-sm font-medium text-gray-700">
                    برند
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500 placeholder:text-gray-400"
                    placeholder="نام برند را وارد کنید"
                  />
                  
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-xs sm:text-sm font-medium text-gray-700">
                    کد محصول (SKU)
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500 placeholder:text-gray-400"
                    placeholder="کد محصول را وارد کنید"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'در حال ثبت...' : 'ثبت محصول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 