# Role-Based Authentication Guide

## 🎯 Overview

The restaurant management system now supports **role-based authentication** with different user types. Each role has access to specific features and dashboards relevant to their responsibilities.

## 👥 Available Roles

### **1. Admin (مدير النظام)**
- **Full Access**: Can see and manage everything
- **Username**: `admin`
- **Password**: `admin2024`
- **Access**: All admin pages, orders, storage, analytics, etc.

### **2. Kitchen (المطبخ)**
- **Food Orders**: Manages kitchen orders and food preparation
- **Username**: `kitchen`
- **Password**: `kitchen2024`
- **Access**: Kitchen dashboard, notifications

### **3. Barista (البارستا)**
- **Beverage Orders**: Manages drink orders and preparation
- **Username**: `barista`
- **Password**: `barista2024`
- **Access**: Barista dashboard, notifications

### **4. Shisha (الشيشة)**
- **Shisha Orders**: Manages shisha orders and preparation
- **Username**: `shisha`
- **Password**: `shisha2024`
- **Access**: Shisha dashboard, notifications

## 🚀 How to Sign In

### **Step 1: Access Admin Panel**
1. Go to `/admin` in your browser
2. You'll see the role-based login page

### **Step 2: Enter Credentials**
1. Enter your username (e.g., `kitchen`, `barista`, `shisha`, `admin`)
2. Enter your password (e.g., `kitchen2024`, `barista2024`, etc.)
3. Click "دخول" (Login)

### **Step 3: Access Your Dashboard**
- Each role will see only their relevant navigation items
- The header will show your role and name
- You can only access pages assigned to your role

## 📋 Role Permissions

### **Admin Role**
✅ **Full Access to:**
- Dashboard overview
- All orders (complete view)
- Kitchen orders
- Barista orders  
- Shisha orders
- Storage management
- Notifications
- Archiving
- Categories management
- Menu items
- Ingredients
- Analytics
- Page settings

### **Kitchen Role**
✅ **Access to:**
- Dashboard overview
- Kitchen orders (food items only)
- Notifications

❌ **No Access to:**
- Barista orders
- Shisha orders
- Storage management
- Archiving
- Categories/Items management
- Analytics

### **Barista Role**
✅ **Access to:**
- Dashboard overview
- Barista orders (drink items only)
- Notifications

❌ **No Access to:**
- Kitchen orders
- Shisha orders
- Storage management
- Archiving
- Categories/Items management
- Analytics

### **Shisha Role**
✅ **Access to:**
- Dashboard overview
- Shisha orders (shisha items only)
- Notifications

❌ **No Access to:**
- Kitchen orders
- Barista orders
- Storage management
- Archiving
- Categories/Items management
- Analytics

## 🛠️ Setup Instructions

### **1. Create Default Users**
1. Go to `/admin/seed-users`
2. Click "إنشاء المستخدمين الافتراضيين" (Create Default Users)
3. Wait for confirmation message

### **2. Test Different Roles**
1. Log out from current session
2. Try logging in with different credentials:
   - `admin` / `admin2024`
   - `kitchen` / `kitchen2024`
   - `barista` / `barista2024`
   - `shisha` / `shisha2024`

### **3. Verify Role Restrictions**
- Each role should only see their assigned navigation items
- Try accessing restricted pages directly (they should be blocked)

## 🔧 Technical Details

### **Authentication Flow**
1. **Login API**: `/api/auth/login` validates credentials
2. **User Storage**: User data stored in localStorage
3. **Role Filtering**: Navigation filtered based on user role
4. **Page Protection**: Each page wrapped with role-based auth

### **Database Structure**
```typescript
interface User {
  username: string;
  password: string;
  role: 'admin' | 'kitchen' | 'barista' | 'shisha';
  name: string;
  isActive: boolean;
}
```

### **Security Features**
- ✅ **Role-based access control**
- ✅ **Session management**
- ✅ **Automatic logout**
- ✅ **Protected routes**
- ✅ **Role-specific navigation**

## 🎨 UI Features

### **Login Page**
- **Role Information**: Shows all available roles with credentials
- **Visual Indicators**: Icons and colors for each role
- **Error Handling**: Clear error messages for invalid credentials

### **Dashboard Headers**
- **Role Badge**: Shows current user's role with icon
- **User Info**: Displays user name and role
- **Logout Button**: Easy access to sign out

### **Navigation**
- **Filtered Menu**: Only shows relevant items for each role
- **Role Icons**: Visual indicators for each section
- **Responsive Design**: Works on mobile and desktop

## 🔄 Switching Between Roles

### **Method 1: Logout and Login**
1. Click "تسجيل الخروج" (Logout) in the header
2. Enter different credentials
3. Access new role's dashboard

### **Method 2: Direct URL Access**
- Each role can access their specific pages directly
- URLs like `/admin/kitchen`, `/admin/barista`, `/admin/shisha`
- Admin can access all URLs

## 🚨 Troubleshooting

### **Common Issues**

1. **"Invalid credentials" error**
   - Check username and password spelling
   - Ensure users are created (use seed page)

2. **Can't access certain pages**
   - Verify your role has permission
   - Check if you're logged in with correct role

3. **Navigation items missing**
   - Your role doesn't have access to those features
   - Contact admin for additional permissions

4. **Login page not showing**
   - Clear browser localStorage
   - Refresh the page

### **Reset Users**
If you need to recreate users:
1. Go to `/admin/seed-users`
2. Click "إنشاء المستخدمين الافتراضيين"
3. If users exist, you'll get an error message
4. Clear the database and try again

## 🎯 Best Practices

### **For Admins**
- Use admin account for system management
- Create additional users as needed
- Monitor user activity through logs

### **For Staff**
- Use your assigned role account only
- Don't share credentials
- Log out when finished

### **Security**
- Change default passwords in production
- Use strong passwords
- Regular password updates
- Monitor login attempts

## 📱 Mobile Support

The role-based authentication works on:
- ✅ **Desktop browsers**
- ✅ **Mobile browsers**
- ✅ **Tablet devices**
- ✅ **Responsive design**

## 🔮 Future Enhancements

Planned features:
- **Password hashing** with bcrypt
- **Session timeout** management
- **User management** interface
- **Role permissions** customization
- **Audit logs** for user actions
- **Two-factor authentication**

---

## 🎉 Ready to Use!

The role-based authentication system is now fully functional. Each staff member can sign in with their specific role and access only the features they need for their job.

**Quick Start:**
1. Go to `/admin/seed-users` to create users
2. Sign in with `kitchen` / `kitchen2024` for kitchen access
3. Sign in with `barista` / `barista2024` for barista access
4. Sign in with `shisha` / `shisha2024` for shisha access
5. Sign in with `admin` / `admin2024` for full access

Enjoy your role-based restaurant management system! 🍽️☕💨

