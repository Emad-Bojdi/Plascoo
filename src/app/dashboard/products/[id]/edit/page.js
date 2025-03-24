'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditProduct() {
  const [formData, setFormData] = useState({
    name: '',
    retailPrice: '',
    wholesalePrice: '',
    brand: '',
    sku: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // دریافت اطلاعات محصول هنگام لود صفحه
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setInitialLoading(true);
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'خطایی در دریافت اطلاعات محصول رخ داده است');
        }
        
        // تنظیم فرم با اطلاعات دریافت شده
        setFormData({
          name: data.product.name,
          retailPrice: data.product.retailPrice,
          wholesalePrice: data.product.wholesalePrice,
          brand: data.product.brand || data.product.category || 'متفرقه',
          sku: data.product.sku || '',
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProduct();
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
    
    // تبدیل قیمت‌ها به عدد
    const productData = {
      ...formData,
      retailPrice: parseFloat(formData.retailPrice),
      wholesalePrice: parseFloat(formData.wholesalePrice),
    };
    
    // بررسی صحت ورودی‌ها
    if (!productData.name || isNaN(productData.retailPrice) || isNaN(productData.wholesalePrice)) {
      setError('لطفا تمام فیلدهای ضروری را پر کنید');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'خطایی در به‌روزرسانی محصول رخ داده است');
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

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-sm sm:text-base text-gray-600">در حال بارگذاری اطلاعات محصول...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ویرایش محصول</h1>
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
                  className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="قیمت تکی را وارد کنید"
                    min="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="wholesalePrice" className="block text-xs sm:text-sm font-medium text-gray-700">
                    قیمت عمده (تومان) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="wholesalePrice"
                    name="wholesalePrice"
                    type="number"
                    required
                    value={formData.wholesalePrice}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border-2 border-red-400 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-pink-50"
                    placeholder="نام برند را وارد کنید"
                  />
                  <span className="text-gray-500 text-xs mt-1">برندهای پیشنهادی: متفرقه، سامسونگ، اپل، شیائومی، هوآوی</span>
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