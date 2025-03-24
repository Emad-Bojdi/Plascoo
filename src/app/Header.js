'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-white hover:text-blue-100 transition-colors">
              سامانه مدیریت محصولات
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4 space-x-reverse">
            {status === 'authenticated' ? (
              <>
                <span className="text-white opacity-90 ml-4">
                  {session.user.name || session.user.email}
                </span>
                <Link href="/dashboard" className="text-white hover:text-blue-100 transition-colors">
                  داشبورد
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  خروج
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors">
                ورود
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 