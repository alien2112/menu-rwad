/**
 * Authentication Middleware for API Routes
 * Protect API endpoints and verify user permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, JWTPayload } from './jwt';

export type UserRole = 'admin' | 'kitchen' | 'barista' | 'shisha' | 'manager' | 'staff';

/**
 * Require authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return { user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Require specific role(s) middleware
 * Verifies user has required role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: JWTPayload } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  const { user } = authResult;

  if (!allowedRoles.includes(user.role as UserRole)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions',
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Require admin role middleware
 * Shorthand for requiring admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  return requireRole(request, ['admin']);
}

/**
 * Optional auth middleware
 * Attaches user if authenticated, but doesn't require it
 */
export async function optionalAuth(
  request: NextRequest
): Promise<{ user: JWTPayload | null }> {
  try {
    const user = await getCurrentUser();
    return { user };
  } catch (error) {
    return { user: null };
  }
}
