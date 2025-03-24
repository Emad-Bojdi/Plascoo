import { NextResponse } from 'next/server';

export async function POST(request) {
  // Return a forbidden response for any registration attempts
  return NextResponse.json(
    { message: 'ثبت‌نام کاربر جدید غیرفعال است' },
    { status: 403 }
  );
} 