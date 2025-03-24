'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to sign-in page
    router.replace('/auth/signin');
  }, [router]);
  
  return null;
} 