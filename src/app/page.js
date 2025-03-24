'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // When authentication status is determined
    if (status === 'authenticated') {
      // If user is authenticated, redirect to dashboard
      router.replace('/dashboard');
    } else if (status === 'unauthenticated') {
      // If user is not authenticated, redirect to sign-in page
      router.replace('/auth/signin');
    }
    // If status is 'loading', we'll wait for it to resolve
  }, [status, router]);

  // Display a simple loading message while redirecting
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
