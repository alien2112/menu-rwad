# Dynamic Menu Categories System

This document explains how the menu categories system has been updated to use MongoDB instead of static data.

## Overview

The menu categories are now stored in MongoDB and fetched dynamically from the API. This allows for:
- Easy management of categories through the admin panel
- Dynamic updates without code changes
- Better scalability and maintainability

## Database Structure

### Category Model
```typescript
interface Category {
  _id: string;
  name: string;              // Arabic name
  nameEn?: string;           // English name
  description?: string;
  image?: string;
  icon?: string;             // Icon URL
  color: string;             // Hex color
  order: number;             // Display order
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}
```

## API Endpoints

### Get Categories
- **Endpoint**: `GET /api/categories`
- **Response**: Returns all active categories sorted by order
- **Usage**: Used by frontend components to display menu items

### Upload/Seed Categories
- **Endpoint**: `POST /api/categories/seed`
- **Purpose**: Uploads the current static categories to MongoDB
- **Usage**: Run this once to migrate from static to dynamic data

### Create Category
- **Endpoint**: `POST /api/categories`
- **Purpose**: Create a new category
- **Body**: Category object

### Update Category
- **Endpoint**: `PUT /api/categories/[id]`
- **Purpose**: Update an existing category

### Delete Category
- **Endpoint**: `DELETE /api/categories/[id]`
- **Purpose**: Delete a category

## Frontend Implementation

### Custom Hook
The `useCategories` hook handles fetching categories from the API:

```typescript
import { useCategories } from '@/hooks/useCategories';

function MenuComponent() {
  const { menuItems, loading, error } = useCategories();
  
  // menuItems contains transformed categories ready for display
  // loading indicates if data is being fetched
  // error contains any error messages
}
```

### Fallback System
If the API fails, the system automatically falls back to static categories to ensure the app continues to work.

## Migration Steps

1. **Upload Categories to MongoDB**:
   ```bash
   # Start your development server
   npm run dev
   
   # In another terminal, run the seed endpoint
   curl -X POST http://localhost:3000/api/categories/seed
   ```

2. **Verify Upload**:
   ```bash
   # Test the API endpoint
   curl http://localhost:3000/api/categories
   ```

3. **Update Frontend**: The frontend components have been updated to use the `useCategories` hook automatically.

## Admin Panel Integration

Categories can be managed through the existing admin panel at `/admin/categories`:
- View all categories
- Create new categories
- Edit existing categories
- Delete categories
- Reorder categories

## Benefits

1. **Dynamic Updates**: Categories can be updated without code deployment
2. **Admin Management**: Easy management through admin panel
3. **Scalability**: Can handle large numbers of categories
4. **Consistency**: Single source of truth for category data
5. **Fallback Safety**: Graceful degradation if API fails

## File Structure

```
app/
├── api/categories/
│   ├── route.ts              # GET/POST categories
│   ├── [id]/route.ts         # PUT/DELETE specific category
│   └── seed/route.ts         # Upload static categories
├── menu/page.tsx             # Updated to use dynamic data
└── admin/categories/         # Admin panel for category management

client/
├── hooks/useCategories.ts    # Custom hook for fetching categories
└── pages/Index.tsx          # Updated to use dynamic data

shared/
└── types.ts                 # Shared TypeScript interfaces

lib/models/
└── Category.ts              # MongoDB Category model
```

## Testing

Run the test script to verify everything works:

```bash
node scripts/test-categories-api.js
```

This will test:
1. GET /api/categories
2. POST /api/categories/seed
3. Verification of uploaded data
