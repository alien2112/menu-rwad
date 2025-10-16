# Multi-Branch Management System - Implementation Guide

## 🎯 Overview

Complete implementation of a multi-branch management system for your restaurant SaaS platform. This enables restaurant owners to manage multiple locations under one account, with branch-specific menus, orders, staff, and analytics.

---

## ✅ What's Been Implemented

### 1. **Database Models Enhanced**

#### **Branch Model** (`lib/models/Branch.ts`)
- ✅ Added `restaurantId` - For multi-tenant support
- ✅ Added `managerId` - To assign branch managers
- ✅ Added `city`, `country`, `timezone` - Location details
- ✅ Indexes added for performance optimization

#### **User Model** (`lib/models/User.ts`)
- ✅ Added new roles: `manager`, `staff` (in addition to existing roles)
- ✅ Added `restaurantId` - Multi-tenant support
- ✅ Added `assignedBranches` - Array of branch IDs user can access
- ✅ Added `primaryBranchId` - Main branch for user
- ✅ Added `permissions` object:
  - `canManageAllBranches`
  - `canViewReports`
  - `canManageMenu`
  - `canManageOrders`
  - `canManageStaff`
- ✅ Indexes added for efficient queries

#### **MenuItem Model** (`lib/models/MenuItem.ts`)
- ✅ Added `branchId` - For branch-specific menu items (optional)
- ✅ Added `restaurantId` - Multi-tenant support
- ✅ Composite indexes for branch-specific queries
- **Note:** Items without `branchId` are global (visible to all branches)

#### **Order Model** (`lib/models/Order.ts`)
- ✅ Added `branchId` - Track which branch placed the order
- ✅ Added `restaurantId` - Multi-tenant support
- ✅ Added `tableNumber` - For dine-in orders
- ✅ Indexes for branch-specific order queries

#### **QRCode Model** (`lib/models/QRCode.ts`)
- ✅ Already had `branchId` support - no changes needed!

---

### 2. **API Routes Updated**

#### **Branch Routes**
- `POST /api/branches` - Now accepts `restaurantId`, `managerId`, `city`, `country`, `timezone`
- `PUT /api/branches/[id]` - Updated to handle all new fields
- `GET /api/branches` - Returns all branches
- `GET /api/branches/[id]` - Returns single branch with full details
- `DELETE /api/branches/[id]` - Prevents deletion of main branch

---

### 3. **UI Components Created**

#### **BranchSelector Component** (`components/BranchSelector.tsx`)
A beautiful dropdown selector for filtering data by branch:
- Shows all active branches
- Optional "All Branches" option
- Displays branch city/location
- Highlights main branch with badge
- Smooth animations
- Responsive design

**Usage Example:**
```tsx
import { BranchSelector } from '@/components/BranchSelector';

function MyPage() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  return (
    <BranchSelector
      selectedBranchId={selectedBranch}
      onBranchChange={setSelectedBranch}
      showAllOption={true}
    />
  );
}
```

---

### 4. **Admin Navigation**

#### **Branch Management Tab Added** (`app/admin/layout.tsx`)
- ✅ New tab: **"إدارة الفروع" (Branch Management)**
- Located prominently after "Orders" in the sidebar
- Icon: Building2 (🏢)
- Only visible to admin role users

---

### 5. **Branch Permission System**

#### **Permission Helper** (`lib/auth/branchPermissions.ts`)
Complete authorization logic for branch-level access:

**Functions Available:**

```typescript
// Check if user can access a specific branch
canAccessBranch(user: IUser, branchId: string): BranchPermissionCheck

// Get all branch IDs user can access (or 'all')
getAccessibleBranches(user: IUser): string[] | 'all'

// Check branch management permissions
canManageBranches(user: IUser): boolean
canViewBranchReports(user: IUser, branchId: string): boolean
canManageBranchMenu(user: IUser, branchId: string): boolean
canManageBranchOrders(user: IUser, branchId: string): boolean
canManageBranchStaff(user: IUser, branchId: string): boolean

// Get MongoDB filter for user's accessible branches
getBranchFilter(user: IUser): Record<string, any>

// Check if user is branch manager
isBranchManager(user: IUser, branchId: string): boolean

// Get role display name in Arabic
getRoleDisplayName(role: string): string
```

**Usage Example:**
```typescript
import { canAccessBranch, getBranchFilter } from '@/lib/auth/branchPermissions';

// Check access
const { canAccess, reason } = canAccessBranch(user, branchId);
if (!canAccess) {
  return res.status(403).json({ error: reason });
}

// Filter queries
const branchFilter = getBranchFilter(user);
const orders = await Order.find({ ...branchFilter, status: 'pending' });
```

---

## 🎨 Existing Features (Already Working)

### Branch Management Pages
- **`/admin/branches`** - List all branches (grid/map view)
- **`/admin/branches/new`** - Create new branch
- **`/admin/branches/[id]`** - Edit branch details

### Features Include:
- Location picker with interactive map
- Opening hours editor (7 days per week)
- Main branch designation
- Branch status (active/inactive/coming_soon)
- Branch deletion (prevents deleting main branch)
- Responsive design with Tailwind CSS

---

## 📋 How to Use the Multi-Branch System

### **For Restaurant Owners (Admins):**

1. **Create Branches:**
   - Navigate to `/admin/branches`
   - Click "إضافة فرع جديد" (Add New Branch)
   - Fill in branch details (name, address, phone, location on map)
   - Set opening hours for each day
   - Optionally assign a manager (using `managerId`)
   - Save the branch

2. **Assign Branch Managers:**
   - Go to Staff Management
   - Create/edit a user with role = `manager`
   - Set their `primaryBranchId` to the branch ID
   - Add `assignedBranches` array if they manage multiple branches

3. **Create Branch-Specific Menu Items:**
   - When creating a menu item, include `branchId` field
   - Items WITHOUT `branchId` are global (shown in all branches)
   - Items WITH `branchId` only show in that specific branch

4. **View Branch-Specific Orders:**
   - Use the `BranchSelector` component in orders page
   - Filter orders by `branchId`

5. **Generate Branch QR Codes:**
   - Navigate to `/admin/qrcodes/new`
   - Select type: "branch"
   - Choose the branch
   - QR codes automatically include `branchId` in URL

---

### **For Branch Managers:**

- Can only access their assigned branch(es)
- Can manage:
  - Orders for their branch
  - Menu items for their branch
  - Staff at their branch
  - View reports for their branch

---

## 🔐 Permission Logic

### **Role Hierarchy:**

| Role | Access Level |
|------|-------------|
| `admin` | All branches, all permissions |
| `manager` | Assigned branches only, full branch control |
| `staff` | Assigned branches only, limited permissions |
| `kitchen` | Department-specific, no branch restrictions |
| `barista` | Department-specific, no branch restrictions |
| `shisha` | Department-specific, no branch restrictions |

### **Permission Checks:**

- **Admin** → Full access to everything
- **Manager** → Access only to `assignedBranches` or `primaryBranchId`
- **Staff** → Same as manager but with limited permissions based on `permissions` object

---

## 🚀 Next Steps (Optional Enhancements)

### **Recommended Implementations:**

1. **Update Orders Page to use BranchSelector:**
   ```tsx
   import { BranchSelector } from '@/components/BranchSelector';

   // Add to orders page
   <BranchSelector
     selectedBranchId={selectedBranch}
     onBranchChange={setSelectedBranch}
   />

   // Filter orders API call
   const query = selectedBranch ? `?branchId=${selectedBranch}` : '';
   const orders = await fetch(`/api/orders${query}`);
   ```

2. **Update Analytics Page for Branch Filtering:**
   - Add BranchSelector to analytics dashboard
   - Pass `branchId` to analytics API endpoints
   - Update endpoints to filter by branch:
     ```typescript
     const branchFilter = branchId ? { branchId } : {};
     const analytics = await Order.aggregate([
       { $match: { ...branchFilter, status: 'delivered' } },
       // ... rest of aggregation
     ]);
     ```

3. **Update Menu Items Page:**
   - Add BranchSelector for filtering menu items
   - When creating items, allow selecting target branch
   - Show badge for branch-specific items

4. **Staff Assignment UI:**
   - Add branch selector when creating/editing staff
   - Multi-select for `assignedBranches`
   - Dropdown for `primaryBranchId`

5. **Branch Performance Dashboard:**
   - Create `/admin/branches/[id]/analytics` page
   - Show sales, orders, top items per branch
   - Compare branch performance

---

## 📊 Database Indexes Added

For optimal performance, the following indexes were added:

### Branch Model:
- `restaurantId`
- `managerId`
- `slug`
- `isActive + order`
- `status`
- `location.lat + location.lng`

### User Model:
- `role + isActive`
- `restaurantId`
- `primaryBranchId`

### MenuItem Model:
- `branchId + categoryId + status`
- `restaurantId + branchId`

### Order Model:
- `branchId + orderDate`
- `restaurantId + branchId`
- `branchId + status`

---

## 🧪 Testing Checklist

- [x] ✅ Branch CRUD operations work
- [x] ✅ Branch selector component displays correctly
- [x] ✅ Branch management tab appears in navigation
- [x] ✅ Models updated with new fields
- [x] ✅ API routes handle new fields
- [x] ✅ Permission helper functions created
- [ ] ⏳ Test branch filtering in orders page
- [ ] ⏳ Test branch-specific menu items
- [ ] ⏳ Test branch manager permissions
- [ ] ⏳ Test analytics with branch filter

---

## 📖 API Documentation

### Create Branch with New Fields

```http
POST /api/branches
Content-Type: application/json

{
  "name": "فرع الرياض",
  "nameEn": "Riyadh Branch",
  "address": "شارع الملك فهد، الرياض",
  "city": "الرياض",
  "country": "المملكة العربية السعودية",
  "timezone": "Asia/Riyadh",
  "phone": "+966 50 123 4567",
  "email": "riyadh@restaurant.com",
  "location": {
    "lat": 24.7136,
    "lng": 46.6753
  },
  "openingHours": [
    { "day": "monday", "open": "09:00", "close": "23:00", "isClosed": false },
    // ... other days
  ],
  "restaurantId": "restaurant123",
  "managerId": "user456",
  "isMainBranch": false,
  "isActive": true,
  "status": "active"
}
```

---

## 🎉 Summary

You now have a **complete multi-branch management system** with:

1. ✅ Branch-aware database models
2. ✅ Branch selection UI component
3. ✅ Permission system for role-based access
4. ✅ Enhanced API routes
5. ✅ Admin navigation with branch management tab
6. ✅ Existing UI for branch CRUD operations

**All changes are backward compatible** - existing functionality continues to work, and branch features are optional (items without `branchId` are global).

---

## 📞 Support

If you need help implementing any of the optional enhancements or have questions about the system, feel free to ask!

**Development Server:** http://localhost:3002

**Next Steps:** Test the branch management UI and start integrating the BranchSelector into your orders and analytics pages!
