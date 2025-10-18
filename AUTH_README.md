# 🔐 Authentication System Documentation

## Overview

This application uses a secure JWT-based authentication system with bcrypt password hashing, HTTP-only cookies, and account lockout protection.

## Features

- ✅ **Secure Password Hashing** - bcryptjs with 12 salt rounds
- ✅ **JWT Tokens** - Access & refresh tokens using `jose` library
- ✅ **HTTP-Only Cookies** - Primary auth storage (more secure than localStorage)
- ✅ **Account Lockout** - 5 failed attempts = 30 minute lockout
- ✅ **Role-Based Access Control** - admin, kitchen, barista, shisha
- ✅ **Automatic Password Validation** - Min 8 chars, uppercase, lowercase, number
- ✅ **Session Management** - 7-day access token, 30-day refresh token

## Demo Credentials

After seeding the database (POST `/api/auth/seed`), use these credentials:

| Role     | Username  | Password      | Access Level           |
|----------|-----------|---------------|------------------------|
| Admin    | `admin`   | `Admin@2024`  | Full system access     |
| Kitchen  | `kitchen` | `Kitchen@2024`| Kitchen orders only    |
| Barista  | `barista` | `Barista@2024`| Barista orders only    |
| Shisha   | `shisha`  | `Shisha@2024` | Shisha orders only     |

## API Endpoints

### POST `/api/auth/login`
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@2024"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "admin",
      "role": "admin",
      "name": "مدير النظام",
      "email": "admin@restaurant.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Response (Failed - Invalid Credentials):**
```json
{
  "success": false,
  "error": "Invalid credentials. 4 attempts remaining."
}
```

**Response (Account Locked):**
```json
{
  "success": false,
  "error": "Account is locked. Please try again in 25 minutes."
}
```

### POST `/api/auth/logout`
Logout and clear auth cookies.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/api/auth/me`
Get current authenticated user info.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "admin",
    "role": "admin",
    "name": "مدير النظام"
  }
}
```

### POST `/api/auth/seed`
Create/reset demo users with hashed passwords.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "message": "Demo users created successfully",
  "credentials": {
    "admin": { "username": "admin", "password": "Admin@2024" },
    ...
  }
}
```

## Architecture

### Password Hashing

Passwords are automatically hashed using the User model's pre-save middleware:

```typescript
// lib/models/User.ts
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password); // bcrypt 12 rounds
  next();
});
```

### JWT Token Flow

1. **Login** → Generate access + refresh tokens → Set HTTP-only cookies
2. **Request** → Read auth_token from cookies → Verify JWT
3. **Logout** → Clear cookies

```typescript
// lib/auth/jwt.ts
const accessToken = await generateAccessToken(payload); // 7 days
const refreshToken = await generateRefreshToken(payload); // 30 days
await setAuthCookie(accessToken, 'auth_token');
```

### Account Lockout

After 5 failed login attempts:
- Account locked for 30 minutes
- `lockUntil` timestamp set in database
- Further login attempts rejected until unlock

```typescript
if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
  await User.findByIdAndUpdate(user._id, {
    lockUntil: new Date(Date.now() + 30 * 60 * 1000)
  });
}
```

## Protected Routes

Use the auth middleware to protect API routes:

```typescript
import { requireAuth, requireAdmin, requireRole } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  // Require any authenticated user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  // OR: Require admin role
  const adminResult = await requireAdmin(request);
  if (adminResult instanceof NextResponse) return adminResult;

  // OR: Require specific roles
  const roleResult = await requireRole(request, ['admin', 'kitchen']);
  if (roleResult instanceof NextResponse) return roleResult;

  // ... your route logic
}
```

## Client-Side Usage

### Login

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({ username, password }),
});

const data = await response.json();
if (data.success) {
  // Store token as backup
  localStorage.setItem('auth_token', data.data.accessToken);
  localStorage.setItem('user_auth', JSON.stringify(data.data.user));
}
```

### Logout

```typescript
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});

localStorage.removeItem('auth_token');
localStorage.removeItem('user_auth');
```

### Check Auth Status

```typescript
const response = await fetch('/api/auth/me', {
  credentials: 'include',
});

const data = await response.json();
if (data.success) {
  console.log('Logged in as:', data.data.username);
}
```

## Security Best Practices

1. **Environment Variables** - Set `JWT_SECRET` in `.env` (use long random string)
2. **HTTPS Only** - In production, cookies are secure (HTTPS only)
3. **HTTP-Only Cookies** - Prevents XSS attacks
4. **SameSite** - Set to 'lax' to prevent CSRF
5. **Password Complexity** - Enforced (8+ chars, uppercase, lowercase, number)
6. **Rate Limiting** - Built-in account lockout after 5 failed attempts
7. **Case-Insensitive Usernames** - Prevents enumeration attacks

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set `JWT_SECRET` to a long random string:
   ```bash
   # Generate secure secret
   openssl rand -base64 32
   ```
3. Update MongoDB URI if needed

## Database Schema

```typescript
interface IUser {
  username: string;
  password: string; // bcrypt hashed
  role: 'admin' | 'kitchen' | 'barista' | 'shisha' | 'manager' | 'staff';
  name: string;
  email?: string;
  isActive: boolean;
  lastLogin?: Date;
  failedLoginAttempts?: number; // Account lockout counter
  lockUntil?: Date; // Unlock timestamp
  permissions?: {
    canManageAllBranches?: boolean;
    canViewReports?: boolean;
    canManageMenu?: boolean;
    canManageOrders?: boolean;
    canManageStaff?: boolean;
  };
}
```

## Migration from Old System

The old system used plain text passwords stored in localStorage. New system:

1. ✅ Passwords hashed with bcrypt
2. ✅ Tokens stored in HTTP-only cookies (more secure)
3. ✅ Account lockout protection
4. ✅ Refresh token support
5. ✅ Better error messages

**To migrate:**
1. Run `POST /api/auth/seed` to create users with hashed passwords
2. Users must log in again with new passwords
3. Old localStorage tokens will be invalid

## Troubleshooting

### "Invalid credentials" on correct password
- Run `POST /api/auth/seed` to reset demo users
- Check console for bcrypt errors
- Verify password meets complexity requirements

### "Account locked"
- Wait 30 minutes or manually reset in database:
  ```javascript
  db.users.updateOne(
    { username: "admin" },
    { $set: { failedLoginAttempts: 0, lockUntil: null } }
  )
  ```

### Cookies not being set
- Check `credentials: 'include'` in fetch requests
- Verify CORS settings allow credentials
- Check browser console for SameSite warnings

### JWT verification fails
- Check `JWT_SECRET` matches between requests
- Verify token hasn't expired (7 day default)
- Check cookies exist in browser DevTools

## Production Checklist

- [ ] Set strong `JWT_SECRET` in environment variables
- [ ] Enable HTTPS (cookies only work on HTTPS in production)
- [ ] Change demo passwords
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS settings
- [ ] Add rate limiting at reverse proxy level
- [ ] Monitor failed login attempts
- [ ] Set up password reset flow
- [ ] Add 2FA for admin accounts (future enhancement)

---

**Built with**: bcryptjs, jose (JWT), Next.js 15, MongoDB
