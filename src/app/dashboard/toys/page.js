'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ToysDashboard() {
  const { data: session } = useSession();
  const [toys, setToys] = useState([]);
  const [filteredToys, setFilteredToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedToys, setSelectedToys] = useState([]);
  const router = useRouter();

  // Search states
  const [searchParams, setSearchParams] = useState({
    name: '',
    brand: '',
    wholesalePrice: '',
    retailPrice: '',
    sku: '',
    inStock: false
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // دریافت لیست اسباب بازی‌ها
  useEffect(() => {
    const fetchToys = async () => {
      try {
        setLoading(true);
        console.log('Fetching toys...');
        const response = await fetch('/api/toys');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.message || 'خطایی در دریافت اسباب بازی‌ها رخ داده است');
        }

        setToys(data.toys);
        setFilteredToys(data.toys);
      } catch (error) {
        console.error('Error fetching toys:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchToys();
  }, []);

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
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    console.log(`Search param changed: ${name} = ${newValue}`);
    
    // Update search parameters
    const newSearchParams = { ...searchParams, [name]: newValue };
    setSearchParams(newSearchParams);
    
    // Apply search filter
    filterToys(newSearchParams);
  };

  // Filter toys based on search parameters
  const filterToys = (params) => {
    try {
      setIsSearching(true);
      
      // If all fields are empty, show all toys
      if (!params.name && !params.brand && !params.sku && !params.wholesalePrice && 
          !params.retailPrice && !params.ageRange && !params.category && 
          !params.material && !params.inStock) {
        console.log('No search parameters - showing all toys');
        setFilteredToys([...toys]);
        return;
      }
      
      // Apply filters
      const filtered = toys.filter(toy => {
        if (!toy) return false;
        
        // Text search fields
        const nameMatch = !params.name || simpleMatch(toy.name, params.name);
        const brandMatch = !params.brand || simpleMatch(toy.brand, params.brand);
        const skuMatch = !params.sku || simpleMatch(toy.sku, params.sku);
        const ageRangeMatch = !params.ageRange || simpleMatch(toy.ageRange, params.ageRange);
        const categoryMatch = !params.category || simpleMatch(toy.category, params.category);
        const materialMatch = !params.material || simpleMatch(toy.material, params.material);
        
        // Price filters
        const wholesalePriceMatch = !params.wholesalePrice || 
          (toy.wholesalePrice && toy.wholesalePrice.toString().includes(params.wholesalePrice));
        const retailPriceMatch = !params.retailPrice || 
          (toy.retailPrice && toy.retailPrice.toString().includes(params.retailPrice));
        
        // Stock filter
        const stockMatch = !params.inStock || 
          (toy.stockQuantity && toy.stockQuantity > 0);
        
        return nameMatch && brandMatch && skuMatch && ageRangeMatch && 
               categoryMatch && materialMatch && wholesalePriceMatch && 
               retailPriceMatch && stockMatch;
      });
      
      console.log(`Found ${filtered.length} matching toys out of ${toys.length}`);
      setFilteredToys(filtered);
    } catch (error) {
      console.error('Error filtering toys:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // جستجو و فیلتر اسباب بازی‌ها
  const handleSearch = () => {
    console.log('Manual search with params:', searchParams);
    filterToys(searchParams);
  };

  // پاک کردن فیلترها
  const resetFilters = () => {
    // Clear search form
    const emptyParams = {
      name: '',
      brand: '',
      wholesalePrice: '',
      retailPrice: '',
      sku: '',
      inStock: false
    };
    
    // Set empty search params
    setSearchParams(emptyParams);
    
    // Reset to show all toys
    setFilteredToys([...toys]);
    console.log(`Reset filters - showing all ${toys.length} toys`);
  };

  const deleteToy = async (toyId) => {
    if (!confirm('آیا از حذف این اسباب بازی اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/toys/${toyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'خطایی در حذف اسباب بازی رخ داده است');
      }

      // به‌روزرسانی لیست اسباب بازی‌ها پس از حذف
      const updatedToys = toys.filter(toy => toy._id !== toyId);
      setToys(updatedToys);
      setFilteredToys(updatedToys);

    } catch (error) {
      console.error('Error deleting toy:', error);
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

  const handleSelectToy = (toyId) => {
    setSelectedToys(prev => {
      if (prev.includes(toyId)) {
        return prev.filter(id => id !== toyId);
      } else {
        return [...prev, toyId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedToys.length === filteredToys.length) {
      setSelectedToys([]);
    } else {
      setSelectedToys(filteredToys.map(toy => toy._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedToys.length) return;

    if (!confirm(`آیا از حذف ${selectedToys.length} اسباب بازی انتخاب شده اطمینان دارید؟`)) {
      return;
    }

    try {
      const response = await fetch('/api/toys/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toyIds: selectedToys }),
      });

      if (!response.ok) {
        throw new Error('خطا در حذف اسباب بازی‌ها');
      }

      // Update the toys list
      setToys(prev => prev.filter(toy => !selectedToys.includes(toy._id)));
      setFilteredToys(prev => prev.filter(toy => !selectedToys.includes(toy._id)));
      setSelectedToys([]);
    } catch (error) {
      console.error('Error deleting toys:', error);
      alert('خطا در حذف اسباب بازی‌ها');
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">مدیریت اسباب بازی‌ها</h1>
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">لیست اسباب بازی‌ها</h2>
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
              <div className="flex gap-2">
                <Link href="/dashboard/toys/new-with-profit"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 w-full sm:w-auto text-center">
                  افزودن با محاسبه سود
                </Link>
                <Link href="/dashboard/toys/new"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 w-full sm:w-auto text-center">
                  افزودن اسباب بازی جدید
                </Link>
              </div>
            </div>
          </div>

          {isSearchOpen && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">جستجوی اسباب بازی‌ها</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                    نام اسباب بازی {isSearching && <span className="text-blue-500 text-xs">(در حال جستجو...)</span>}
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
                    برند {isSearching && <span className="text-blue-500 text-xs">(در حال جستجو...)</span>}
                  </label>
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
                </div>

                <div>
                  <label htmlFor="sku" className="block text-xs font-medium text-gray-700 mb-1">
                    کد اسباب بازی (SKU) {isSearching && <span className="text-blue-500 text-xs">(در حال جستجو...)</span>}
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={searchParams.sku}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] text-gray-600"
                    placeholder="جستجو با کد محصول"
                    autoComplete="off"
                  />
                </div>

                

                

                

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="wholesalePrice" className="block text-xs font-medium text-gray-700 mb-1">قیمت عمده (تومان)</label>
                    <input
                      type="number"
                      id="wholesalePrice"
                      name="wholesalePrice"
                      value={searchParams.wholesalePrice}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] bg-white text-gray-600"
                      placeholder="قیمت عمده"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="retailPrice" className="block text-xs font-medium text-gray-700 mb-1">قیمت تکی (تومان)</label>
                    <input
                      type="number"
                      id="retailPrice"
                      name="retailPrice"
                      value={searchParams.retailPrice}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#545454] bg-white text-gray-600"
                      placeholder="قیمت تکی"
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
            <div className="text-center py-8 sm:py-10 text-sm sm:text-base">در حال بارگذاری اسباب بازی‌ها...</div>
          ) : filteredToys.length === 0 ? (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {toys.length === 0 ? 'هنوز اسباب بازی ثبت نشده است.' : 'هیچ اسباب بازی با معیارهای جستجوی شما یافت نشد.'}
              </p>
              {toys.length === 0 ? (
                <Link href="/dashboard/toys/new"
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700">
                  افزودن اولین اسباب بازی
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
              {/* Display count of filtered toys */}
              <div className="p-3 bg-blue-50 text-blue-700 text-xs border-b border-blue-100">
                {isSearching ? (
                  <p>در حال جستجو...</p>
                ) : (
                  <p>نمایش {filteredToys.length} اسباب بازی {toys.length !== filteredToys.length ? `از ${toys.length} اسباب بازی` : ''}</p>
                )}
              </div>
              
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        نام اسباب بازی
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        کد محصول
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        برند
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                         قیمت تکی(تومان) 
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                         قیمت عمده(تومان) 
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(filteredToys) && filteredToys.length > 0 ? (
                      filteredToys.map((toy) => (
                        <tr key={toy._id}>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {toy.name}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {toy.sku}
                          </td>
                        
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {toy.brand || '-'}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {toy.retailPrice ? toy.retailPrice.toLocaleString() : 0}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {toy.wholesalePrice ? toy.wholesalePrice.toLocaleString() : 0}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-left text-xs sm:text-sm font-medium">
                            <div className="flex space-x-2 space-x-reverse">
                              <Link href={`/dashboard/toys/${toy._id}/edit`}
                                className="text-blue-600 hover:text-blue-900">
                                ویرایش
                              </Link>
                              <button
                                onClick={() => deleteToy(toy._id)}
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
                        <td colSpan="7" className="text-center py-4 text-gray-500">
                          {isSearching ? 'در حال جستجو...' : 'هیچ اسباب بازی یافت نشد'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {selectedToys.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleDeleteSelected}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      حذف {selectedToys.length} اسباب بازی انتخاب شده
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                <div className="grid grid-cols-1 gap-4 p-4">
                  {Array.isArray(filteredToys) && filteredToys.length > 0 ? (
                    filteredToys.map((toy) => (
                      <div key={toy._id} className="bg-white border rounded-lg shadow-sm p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">{toy.name}</h3>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">محدوده سنی:</p>
                            <p className="font-semibold text-[#282828]">{toy.ageRange || '-'}</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">دسته‌بندی:</p>
                            <p className="font-semibold text-[#282828]">{toy.category || '-'}</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">برند:</p>
                            <p className="font-semibold text-[#282828]">{toy.brand || '-'}</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">قیمت:</p>
                            <p className="font-semibold text-[#282828]">{toy.retailPrice ? toy.retailPrice.toLocaleString() : 0} تومان</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">موجودی:</p>
                            <p className="font-semibold text-[#282828]">{toy.stockQuantity || 0}</p>
                          </div>
                          <div className='flex flex-col space-y-2'>
                            <p className="text-gray-500">کد محصول:</p>
                            <p className="font-semibold text-[#282828]">{toy.sku || '-'}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-2">
                          <Link href={`/dashboard/toys/${toy._id}/edit`}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium">
                            ویرایش
                          </Link>
                          <button
                            onClick={() => deleteToy(toy._id)}
                            className="text-red-600 hover:text-red-900 text-xs font-medium"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {isSearching ? 'در حال جستجو...' : 'هیچ اسباب بازی یافت نشد'}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500">
                  نمایش {filteredToys.length} اسباب بازی {toys.length !== filteredToys.length ? `از ${toys.length} اسباب بازی` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 