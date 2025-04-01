'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Dashboard() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const router = useRouter();

  // Search states
  const [searchParams, setSearchParams] = useState({
    name: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sku: ''
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // دریافت لیست محصولات
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products...');
        const response = await fetch('/api/products');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'خطایی در دریافت محصولات رخ داده است');
        }

        setProducts(data.products);
        setFilteredProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // جستجو با تاخیر برای فیلدهای متنی
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // A simple function to check if a string contains another string, case insensitive and ignoring spaces
  const simpleMatch = (text, query) => {
    if (!text || !query) return !query; // If query is empty, it's a match

    // Normalize both strings: remove spaces and convert to lowercase
    const normalizedText = String(text).replace(/\s+/g, '').toLowerCase();
    const normalizedQuery = String(query).replace(/\s+/g, '').toLowerCase();
    
    return normalizedText.includes(normalizedQuery);
  };

  // تغییر پارامترهای جستجو
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    console.log(`Search param changed: ${name} = ${value}`);
    
    // Update search parameters
    const newSearchParams = { ...searchParams, [name]: value };
    setSearchParams(newSearchParams);
    
    // Apply search filter
    filterProducts(newSearchParams);
  };

  // Filter products based on search parameters
  const filterProducts = (params) => {
    try {
      setIsSearching(true);
      
      // If all fields are empty, show all products
      if (!params.name && !params.brand && !params.sku && !params.minPrice && !params.maxPrice) {
        console.log('No search parameters - showing all products');
        setFilteredProducts([...products]);
        return;
      }
      
      // Apply filters
      const filtered = products.filter(product => {
        if (!product) return false;
        
        // Text search fields
        const nameMatch = !params.name || simpleMatch(product.name, params.name);
        const brandMatch = !params.brand || simpleMatch(product.brand, params.brand);
        const skuMatch = !params.sku || simpleMatch(product.sku, params.sku);
        
        // Price range
        const minPriceMatch = !params.minPrice || 
          (product.retailPrice && product.retailPrice >= Number(params.minPrice));
        const maxPriceMatch = !params.maxPrice || 
          (product.retailPrice && product.retailPrice <= Number(params.maxPrice));
        
        return nameMatch && brandMatch && skuMatch && minPriceMatch && maxPriceMatch;
      });
      
      console.log(`Found ${filtered.length} matching products out of ${products.length}`);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error filtering products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // جستجو و فیلتر محصولات
  const handleSearch = () => {
    console.log('Manual search with params:', searchParams);
    filterProducts(searchParams);
  };

  // پاک کردن فیلترها
  const resetFilters = () => {
    // Clear search form
    const emptyParams = {
      name: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sku: ''
    };
    
    // Set empty search params
    setSearchParams(emptyParams);
    
    // Reset to show all products
    setFilteredProducts([...products]);
    console.log(`Reset filters - showing all ${products.length} products`);
  };

  const deleteProduct = async (productId) => {
    if (!confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطایی در حذف محصول رخ داده است');
      }

      // به‌روزرسانی لیست محصولات پس از حذف
      const updatedProducts = products.filter(product => product._id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);

    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message);
    }
  };

  // کلید میانبر برای جستجو
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F یا Cmd+F برای باز کردن جستجو
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault(); // جلوگیری از جستجوی مرورگر
        setIsSearchOpen(true);

        // فوکوس روی فیلد جستجو با کمی تاخیر (برای اطمینان از رندر شدن)
        setTimeout(() => {
          if (nameInputRef.current) {
            nameInputRef.current.focus();
          }
        }, 100);
      }

      // Escape برای بستن جستجو
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedProducts.length) return;

    if (!confirm(`آیا از حذف ${selectedProducts.length} محصول انتخاب شده اطمینان دارید؟`)) {
      return;
    }

    try {
      const response = await fetch('/api/products/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds: selectedProducts }),
      });

      if (!response.ok) {
        throw new Error('خطا در حذف محصولات');
      }

      // Update the products list
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product._id)));
      setFilteredProducts(prev => prev.filter(product => !selectedProducts.includes(product._id)));
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('خطا در حذف محصولات');
    }
  };

  // اگر کاربر لاگین نشده باشد
  if (!mounted || session === null) {
    return <div className="flex justify-center items-center min-h-screen">بارگذاری...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-white shadow hidden sm:block">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">داشبورد مدیریت محصولات</h1>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <span className="text-sm sm:text-base text-gray-600">خوش آمدید، {session?.user?.name}</span>
            <Link href="/api/auth/signout"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-700">
              خروج
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">لیست محصولات</h2>
              <Link href="/api/auth/signout" className="sm:hidden px-2 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700">
                خروج
              </Link>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => {
                      if (nameInputRef.current) {
                        nameInputRef.current.focus();
                      }
                    }, 100);
                  }
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-md hover:bg-blue-600 flex-grow sm:flex-grow-0"
              >
                {isSearchOpen ? 'بستن جستجو' : 'جستجوی پیشرفته (Ctrl+F)'}
              </button>
              <Link href="/dashboard/products/new"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 w-full sm:w-auto text-center">
                افزودن محصول جدید
              </Link>
              <Link href="/dashboard/products/new-with-profit"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 w-full sm:w-auto text-center">
                افزودن محصول با محاسبه سود
              </Link>
            </div>
          </div>

          {isSearchOpen && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">جستجوی محصولات</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                    نام محصول {isSearching && <span className="text-blue-500 text-xs">(در حال جستجو...)</span>}
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="name"
                    name="name"
                    value={searchParams.name}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] text-gray-600"
                    placeholder="جستجو به صورت زنده با تایپ کردن"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-xs font-medium text-gray-700 mb-1">
                    برند  {isSearching && <span className="text-blue-500 text-xs">(در حال جستجو...)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={searchParams.brand}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] bg-white text-gray-600"
                      placeholder="جستجو با تایپ کردن نام برند"
                      autoComplete="off"
                    />
                    {/* <span className="absolute inset-y-0 right-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span> */}
                  </div>

                </div>

                <div>
                  <label htmlFor="sku" className="block text-xs font-medium text-gray-700 mb-1">
                    کد محصول (SKU) {isSearching && <span className="text-blue-500 text-xs">(در حال جستجو...)</span>}
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={searchParams.sku}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454]  text-gray-600"
                    placeholder="جستجو با کد محصول"
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="minPrice" className="block text-xs font-medium text-gray-700 mb-1">حداقل قیمت (تومان)</label>
                    <input
                      type="number"
                      id="minPrice"
                      name="minPrice"
                      value={searchParams.minPrice}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] bg-white text-gray-600"
                      placeholder="حداقل قیمت"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="maxPrice" className="block text-xs font-medium text-gray-700 mb-1">حداکثر قیمت (تومان)</label>
                    <input
                      type="number"
                      id="maxPrice"
                      name="maxPrice"
                      value={searchParams.maxPrice}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] bg-white text-gray-600"
                      placeholder="حداکثر قیمت"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 lg:col-span-4">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-1.5 bg-gray-100 text-gray-800 text-xs rounded-md hover:bg-gray-200"
                  >
                    پاک کردن فیلترها
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                  >
                    جستجو
                  </button>
                </div>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-100 p-3 sm:p-4 mb-4 sm:mb-6 rounded-md text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 sm:py-10 text-sm sm:text-base">در حال بارگذاری محصولات...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {products.length === 0 ? 'هنوز محصولی ثبت نشده است.' : 'هیچ محصولی با معیارهای جستجوی شما یافت نشد.'}
              </p>
              {products.length === 0 ? (
                <Link href="/dashboard/products/new"
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700">
                  افزودن اولین محصول
                </Link>
              ) : (
                <button
                  onClick={resetFilters}
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-800 text-xs sm:text-sm rounded-md hover:bg-gray-200"
                >
                  پاک کردن فیلترها
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              {/* Display count of filtered products */}
              <div className="p-3 bg-blue-50 text-blue-700 text-xs border-b border-blue-100">
                {isSearching ? (
                  <p>در حال جستجو...</p>
                ) : (
                  <p>نمایش {filteredProducts.length} محصول {products.length !== filteredProducts.length ? `از ${products.length} محصول` : ''}</p>
                )}
              </div>
              
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نام محصول
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کد محصول (SKU)
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        برند
                      </th>
                      
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        قیمت تکی (تومان)
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        قیمت عمده (تومان)
                      </th>
                      
                      
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {product.sku || '-'}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {product.brand || '-'}
                          </td>
                          
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {product.retailPrice ? product.retailPrice.toLocaleString() : 0}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {
                              product.wholesalePrice !== null && product.wholesalePrice !== undefined 
                                ? product.wholesalePrice.toLocaleString() 
                                : 0
                            }
                          </td>

                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-left text-xs sm:text-sm font-medium">
                            <div className="flex space-x-2 space-x-reverse">
                              <Link href={`/dashboard/products/${product._id}/edit`}
                                className="text-blue-600 hover:text-blue-900">
                                ویرایش
                              </Link>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 mr-[10px]"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          {isSearching ? 'در حال جستجو...' : 'هیچ محصولی یافت نشد'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {selectedProducts.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleDeleteSelected}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      حذف {selectedProducts.length} محصول انتخاب شده
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                <div className="grid grid-cols-1 gap-4 p-4">
                  {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div key={product._id} className="bg-white border rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">{product.name}</h3>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">قیمت تکی:</p>
                            <p className="font-semibold text-[#282828]">{product.retailPrice ? product.retailPrice.toLocaleString() : 0} تومان</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">قیمت عمده:</p>
                            <p className="font-semibold text-[#282828]">{
                              product.wholesalePrice !== null && product.wholesalePrice !== undefined 
                                ? product.wholesalePrice.toLocaleString() 
                                : 0
                            } تومان</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">برند:</p>
                            <p className="font-semibold text-[#282828]">{product.brand || '-'}</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">کد محصول:</p>
                            <p className="font-semibold text-[#282828]">{product.sku || '-'}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-2">
                          <Link href={`/dashboard/products/${product._id}/edit`}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium">
                            ویرایش
                          </Link>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900 text-xs font-medium"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {isSearching ? 'در حال جستجو...' : 'هیچ محصولی یافت نشد'}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">
                  نمایش {filteredProducts.length} محصول {products.length !== filteredProducts.length ? `از ${products.length} محصول` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}