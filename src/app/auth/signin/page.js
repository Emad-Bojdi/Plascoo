'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName || !password) {
      setError('لطفا تمام فیلدها را پر کنید');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        userName,
        password,
      });
      
      if (result.error) {
        setError('نام کاربری یا رمز عبور اشتباه است');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('مشکلی در ورود به سیستم پیش آمد');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ورود به سیستم</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            لطفا با اطلاعات کاربری خود وارد شوید
          </p>
        </div>
        
        {error && (
          <div className="p-3 sm:p-4 text-xs sm:text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="userName" className="block text-xs sm:text-sm font-medium text-gray-700">
              نام کاربری
            </label>
            <input
              id="userName"
              name="userName"
              autoComplete="userName"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs text-[#282828] sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-amber-50"
              dir="ltr"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs text-[#282828] sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              dir="ltr"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </div>
        </form>
        
        {/* <div className="mt-4 text-center">
          <Link href="/" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">
            بازگشت به صفحه اصلی
          </Link>
        </div> */}
      </div>
    </div>
  );
} 