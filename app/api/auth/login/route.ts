import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateAccessToken, generateRefreshToken, setAuthCookie } from '@/lib/auth/jwt';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username (case-insensitive)
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          success: false,
          error: `Account is locked. Please try again in ${minutesLeft} minutes.`,
        },
        { status: 423 }
      );
    }

    // Verify password using bcrypt
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock the account
        await User.findByIdAndUpdate(user._id, {
          failedLoginAttempts: failedAttempts,
          lockUntil: new Date(Date.now() + LOCK_TIME),
        });

        return NextResponse.json(
          {
            success: false,
            error: `Account locked due to too many failed attempts. Please try again in 30 minutes.`,
          },
          { status: 423 }
        );
      }

      await User.findByIdAndUpdate(user._id, {
        failedLoginAttempts: failedAttempts,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - failedAttempts} attempts remaining.`,
        },
        { status: 401 }
      );
    }

    // Successful login - reset failed attempts and update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    // Generate JWT tokens
    const payload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      name: user.name,
    };

    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    // Set HTTP-only secure cookies
    await setAuthCookie(accessToken, 'auth_token');
    await setAuthCookie(refreshToken, 'refresh_token');

    // Return user info (without password) and token
    const userInfo = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo,
        accessToken, // Also return in response for client-side storage option
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

