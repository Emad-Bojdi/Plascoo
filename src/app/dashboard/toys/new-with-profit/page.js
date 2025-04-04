'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewToyWithProfit() {
  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    wholesaleProfitPercentage: '',
    retailProfitPercentage: '',
    brand: '',
    category: '',
    ageRange: '',
    material: '',
    stockQuantity: '',
    sku: '',
  });
  const [calculatedPrices, setCalculatedPrices] = useState({
    wholesalePrice: 0,
    retailPrice: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pricesCalculated, setPricesCalculated] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset calculated prices flag when input values change
    if (name === 'purchasePrice' || name === 'wholesaleProfitPercentage' || name === 'retailProfitPercentage') {
      setPricesCalculated(false);
    }
  };

  const calculatePrices = () => {
    // Validate required fields for calculation
    if (!formData.purchasePrice || !formData.wholesaleProfitPercentage || !formData.retailProfitPercentage) {
      setError('لطفا قیمت خرید و درصدهای سود را وارد کنید');
      return;
    }

    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const wholesaleProfit = parseFloat(formData.wholesaleProfitPercentage) || 0;
    const retailProfit = parseFloat(formData.retailProfitPercentage) || 0;

    // Calculate wholesale price based on purchase price and wholesale profit percentage
    const wholesalePrice = purchasePrice + (purchasePrice * wholesaleProfit / 100);
    // Calculate retail price based on purchase price and retail profit percentage
    const retailPrice = purchasePrice + (purchasePrice * retailProfit / 100);
    
    setCalculatedPrices({
      wholesalePrice: wholesalePrice || 0,
      retailPrice: retailPrice || 0,
    });
    
    setPricesCalculated(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.name || !pricesCalculated) {
      setError('لطفا نام اسباب بازی را وارد کنید و قیمت‌ها را محاسبه کنید');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/toys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          purchasePrice: parseFloat(formData.purchasePrice),
          wholesalePrice: calculatedPrices.wholesalePrice,
          retailPrice: calculatedPrices.retailPrice,
          brand: formData.brand,
          category: formData.category,
          ageRange: formData.ageRange,
          material: formData.material,
          stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity, 10) : 0,
          sku: formData.sku,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'خطایی در ثبت اسباب بازی رخ داده است');
      }
      
      router.push('/dashboard/toys');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">افزودن اسباب بازی جدید با محاسبه سود</h1>
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
                    قیمت خرید (تومان) <span className="text-red-500">*</span>
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
                  <label htmlFor="wholesaleProfitPercentage" className="block text-xs sm:text-sm font-medium text-gray-700">
                    درصد سود عمده <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="wholesaleProfitPercentage"
                    name="wholesaleProfitPercentage"
                    type="number"
                    value={formData.wholesaleProfitPercentage}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="درصد سود عمده را وارد کنید"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label htmlFor="retailProfitPercentage" className="block text-xs sm:text-sm font-medium text-gray-700">
                    درصد سود تکی <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="retailProfitPercentage"
                    name="retailProfitPercentage"
                    type="number"
                    value={formData.retailProfitPercentage}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="درصد سود تکی را وارد کنید"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={calculatePrices}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  محاسبه قیمت‌ها
                </button>
              </div>

              <div className={`bg-gray-50 p-4 rounded-md ${pricesCalculated ? 'border-2 border-green-500' : ''}`}>
                <h3 className="text-sm font-medium text-gray-700 mb-2">قیمت‌های محاسبه شده:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">قیمت عمده (تومان)</label>
                    <div className="text-sm font-medium text-gray-900">
                      {calculatedPrices.wholesalePrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">قیمت تکی (تومان)</label>
                    <div className="text-sm font-medium text-gray-900">
                      {calculatedPrices.retailPrice.toLocaleString()}
                    </div>
                  </div>
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
                    placeholder="برند اسباب بازی را وارد کنید"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-gray-700">
                    دسته‌بندی
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="دسته‌بندی را وارد کنید"
                  />
                </div>
                
                <div>
                  <label htmlFor="ageRange" className="block text-xs sm:text-sm font-medium text-gray-700">
                    محدوده سنی
                  </label>
                  <input
                    id="ageRange"
                    name="ageRange"
                    type="text"
                    value={formData.ageRange}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="محدوده سنی را وارد کنید (مثلا: 3-6 سال)"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="material" className="block text-xs sm:text-sm font-medium text-gray-700">
                    جنس
                  </label>
                  <input
                    id="material"
                    name="material"
                    type="text"
                    value={formData.material}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="جنس اسباب بازی را وارد کنید"
                  />
                </div>
                
                <div>
                  <label htmlFor="stockQuantity" className="block text-xs sm:text-sm font-medium text-gray-700">
                    موجودی
                  </label>
                  <input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="تعداد موجودی را وارد کنید"
                    min="0"
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
                    className="mt-1 block w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="کد محصول را وارد کنید"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !pricesCalculated}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'در حال ثبت...' : 'ذخیره اسباب بازی'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 