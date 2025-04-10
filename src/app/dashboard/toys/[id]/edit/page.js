'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditToy() {
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    wholesalePrice: '',
    retailPrice: '',
    brand: '',
    sku: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // دریافت اطلاعات اسباب بازی هنگام لود صفحه
  useEffect(() => {
    const fetchToy = async () => {
      try {
        setInitialLoading(true);
        const response = await fetch(`/api/toys/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'خطایی در دریافت اطلاعات اسباب بازی رخ داده است');
        }
        
        // تنظیم فرم با اطلاعات دریافت شده
        setFormData({
          name: data.toy.name,
          purchasePrice: data.toy.purchasePrice || 0,
          wholesalePrice: data.toy.wholesalePrice || 0,
          retailPrice: data.toy.retailPrice || 0,
          brand: data.toy.brand || '',
          category: data.toy.category || '',
          ageRange: data.toy.ageRange || '',
          material: data.toy.material || '',
          stockQuantity: data.toy.stockQuantity || 0,
          sku: data.toy.sku || '',
        });
      } catch (error) {
        console.error('Error fetching toy:', error);
        setError(error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchToy();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // تبدیل فیلدهای عددی به عدد
    const toyData = {
      ...formData,
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
      purchasePrice: parseFloat(formData.purchasePrice),
      stockQuantity: parseInt(formData.stockQuantity, 10),
    };
    
    // بررسی صحت ورودی‌ها
    if (!toyData.name || isNaN(toyData.retailPrice)) {
      setError('لطفا تمام فیلدهای ضروری را پر کنید');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/toys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toyData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'خطایی در به‌روزرسانی اسباب بازی رخ داده است');
      }
      
      // در صورت موفقیت، هدایت به صفحه داشبورد اسباب بازی‌ها
      router.push('/dashboard/toys');
      router.refresh();
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-sm sm:text-base text-gray-600">در حال بارگذاری اطلاعات اسباب بازی...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ویرایش اسباب بازی</h1>
            <Link href="/dashboard/toys" className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 text-white text-xs sm:text-sm rounded-md hover:bg-gray-600 w-full sm:w-auto text-center">
              بازگشت به لیست اسباب بازی‌ها
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
                  نام اسباب بازی <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="نام اسباب بازی را وارد کنید"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="purchasePrice" className="block text-xs sm:text-sm font-medium text-gray-700">
                    قیمت خرید (تومان)
                  </label>
                  <input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="قیمت خرید را وارد کنید"
                    min="0"
                  />
                </div>
                
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="قیمت عمده را وارد کنید"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="نام برند را وارد کنید"
                  />
                </div>
                
               
                
                
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                
                
                
                
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 