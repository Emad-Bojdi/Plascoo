'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  // Protect dashboard routes - redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
          <h2 className="text-xl font-medium text-gray-700">در حال بارگذاری...</h2>
          <p className="mt-2 text-gray-500">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  // Return only the children, letting the dashboard page control its own layout
  return children;
} 