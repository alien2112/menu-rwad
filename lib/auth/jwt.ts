/**
 * JWT Authentication Utilities
 * Secure token generation and verification using jose library
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Secret key for JWT signing (use environment variable in production)
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return new TextEncoder().encode(secret);
};

// Token expiration time
const TOKEN_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha' | 'manager' | 'staff';
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(getJWTSecret());

    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * Generate JWT refresh token
 */
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT({ userId: payload.userId, username: payload.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .sign(getJWTSecret());

    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, getJWTSecret());
    return verified.payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Set HTTP-only secure cookie with JWT token
 */
export async function setAuthCookie(token: string, cookieName = 'auth_token') {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Get auth token from cookies
 */
export async function getAuthToken(cookieName = 'auth_token'): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value;
}

/**
 * Remove auth cookie (logout)
 */
export async function removeAuthCookie(cookieName = 'auth_token') {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Get current authenticated user from request cookies
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
