import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/jwt';

export async function POST() {
  try {
    // Remove auth cookies
    await removeAuthCookie('auth_token');
    await removeAuthCookie('refresh_token');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
