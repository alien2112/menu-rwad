# 🎯 Admin Panel - Maraksh Restaurant

A complete, responsive admin panel for managing your restaurant menu, built with Next.js 15, MongoDB, and TailwindCSS.

## ✨ Features

### 📋 Categories Management
- ✅ Add, edit, and delete menu categories
- 🎨 Custom color picker for each category
- 🖼️ Image upload support
- 📊 Ordering and status control
- 🌐 Bilingual support (Arabic/English)

### 🍕 Menu Items Management
- ✅ Complete CRUD operations for menu items
- 💰 Price and discount pricing
- 🖼️ Multiple image support
- 🎨 Custom color themes per item
- 🥗 Ingredient management with customizable portions
- ⏱️ Preparation time tracking
- 🔥 Calorie information
- 🏷️ Tags and allergen information
- ⭐ Featured items support
- 📊 Status control (active/inactive/out of stock)

### 🥗 Ingredients Management
- ✅ Add and manage ingredients
- 📏 Unit-based measurement system (g, ml, piece, cup, etc.)
- 💵 Price per unit tracking
- 🎨 Color coding for ingredients
- 🔢 Customizable portion sizes (min/max/default)
- ⚠️ Allergen tracking
- 🖼️ Image support

### 🎁 Offers & Promotions
- ✅ Multiple offer types:
  - 📊 Percentage discounts
  - 💵 Fixed amount discounts
  - 🎁 Buy X Get Y deals
  - 🆓 Free item promotions
- 📅 Start and end date scheduling
- 🎫 Promo code support
- 💰 Minimum purchase and maximum discount limits
- 🎯 Category and item-specific offers
- 📊 Usage tracking and limits

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or pnpm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure MongoDB:**

Update the `.env` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/maraksh
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maraksh
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Access the admin panel:**
Open [http://localhost:3000/admin](http://localhost:3000/admin)

## 📁 Project Structure

```
app/
├── admin/
│   ├── layout.tsx           # Admin layout with sidebar
│   ├── page.tsx             # Dashboard
│   ├── categories/
│   │   └── page.tsx         # Categories management
│   ├── items/
│   │   └── page.tsx         # Menu items management
│   ├── ingredients/
│   │   └── page.tsx         # Ingredients management
│   └── offers/
│       └── page.tsx         # Offers & promotions
│
├── api/
│   ├── categories/
│   │   ├── route.ts         # GET, POST categories
│   │   └── [id]/route.ts    # GET, PUT, DELETE by ID
│   ├── items/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── ingredients/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── offers/
│       ├── route.ts
│       └── [id]/route.ts
│
components/
└── admin/
    ├── ColorPicker.tsx      # Color selection component
    └── ImageUpload.tsx      # Image upload with preview
│
lib/
├── mongodb.ts               # MongoDB connection
└── models/
    ├── Category.ts          # Category schema
    ├── MenuItem.ts          # Menu item schema
    ├── Ingredient.ts        # Ingredient schema
    └── Offer.ts             # Offer schema
```

## 🎨 Design Features

### Glass Morphism Design
- Beautiful glass-effect cards
- Backdrop blur for modern UI
- Coffee-themed color palette
- Smooth transitions and animations

### Responsive Layout
- ✅ Mobile-first design
- 📱 Collapsible sidebar for mobile
- 💻 Optimized for desktop and tablet
- 🔄 Adaptive grid layouts

### Color Scheme
- **Primary Brown:** `#4F3500` - Coffee brown
- **Secondary Brown:** `#3E2901` - Darker brown
- **Green Accent:** `#00BF89` - Action buttons
- **Glass Effect:** White with 7% opacity + 40px blur

## 📊 Database Models

### Category Model
```typescript
{
  name: string,              // Arabic name
  nameEn?: string,           // English name
  description?: string,
  image?: string,
  color: string,             // Hex color
  icon?: string,
  order: number,
  status: 'active' | 'inactive'
}
```

### MenuItem Model
```typescript
{
  name: string,
  nameEn?: string,
  description?: string,
  descriptionEn?: string,
  categoryId: string,
  price: number,
  discountPrice?: number,
  image?: string,
  images?: string[],
  color?: string,
  ingredients: [{
    ingredientId: string,
    portion: number,
    required: boolean
  }],
  preparationTime?: number,
  calories?: number,
  servingSize?: string,
  tags?: string[],
  allergens?: string[],
  status: 'active' | 'inactive' | 'out_of_stock',
  featured: boolean,
  order: number
}
```

### Ingredient Model
```typescript
{
  name: string,
  nameEn?: string,
  description?: string,
  image?: string,
  unit: string,              // g, ml, piece, cup, etc.
  defaultPortion: number,
  minPortion?: number,
  maxPortion?: number,
  pricePerUnit: number,
  color?: string,
  allergens?: string[],
  status: 'active' | 'inactive'
}
```

### Offer Model
```typescript
{
  title: string,
  titleEn?: string,
  description?: string,
  descriptionEn?: string,
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_item',
  discountValue?: number,
  minPurchase?: number,
  maxDiscount?: number,
  image?: string,
  color?: string,
  applicableCategories?: string[],
  applicableItems?: string[],
  buyQuantity?: number,
  getQuantity?: number,
  freeItemId?: string,
  code?: string,             // Promo code
  startDate: Date,
  endDate: Date,
  status: 'active' | 'inactive' | 'expired',
  usageLimit?: number,
  usedCount: number,
  order: number
}
```

## 🔌 API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/[id]` - Get category by ID
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Items
- `GET /api/items` - Get all items (filter by categoryId)
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get item by ID
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Create new ingredient
- `GET /api/ingredients/[id]` - Get ingredient by ID
- `PUT /api/ingredients/[id]` - Update ingredient
- `DELETE /api/ingredients/[id]` - Delete ingredient

### Offers
- `GET /api/offers` - Get all offers
- `POST /api/offers` - Create new offer
- `GET /api/offers/[id]` - Get offer by ID
- `PUT /api/offers/[id]` - Update offer
- `DELETE /api/offers/[id]` - Delete offer

## 🎯 Usage Examples

### Creating a Category
1. Navigate to `/admin/categories`
2. Click "إضافة فئة جديدة" (Add New Category)
3. Fill in the form (name is required)
4. Choose a color and upload an image
5. Set order and status
6. Click "إضافة" (Add)

### Creating a Menu Item
1. Navigate to `/admin/items`
2. Click "إضافة منتج جديد" (Add New Product)
3. Fill in basic information (name, description, price)
4. Select category
5. Upload image
6. Add ingredients with custom portions
7. Set preparation time, calories, and serving size
8. Configure status and featured flag
9. Click "إضافة" (Add)

### Creating an Offer
1. Navigate to `/admin/offers`
2. Click "إضافة عرض جديد" (Add New Offer)
3. Choose offer type (percentage, fixed, buy X get Y, free item)
4. Set discount value or quantities
5. Add promo code (optional)
6. Set start and end dates
7. Configure minimum purchase and usage limits
8. Click "إضافة" (Add)

## 🔒 Security Notes

⚠️ **Important:** This admin panel does NOT include authentication. Before deploying to production:

1. Add authentication (NextAuth.js, Clerk, Auth0, etc.)
2. Protect all `/admin` routes with middleware
3. Secure all API routes
4. Add role-based access control
5. Use environment variables for sensitive data
6. Enable CORS protection
7. Add rate limiting

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  'coffee-primary': 'hsl(var(--coffee-primary))',
  'coffee-secondary': 'hsl(var(--coffee-secondary))',
  'coffee-green': 'hsl(var(--coffee-green))',
  // Add your custom colors
}
```

### Adding New Features
1. Create new model in `lib/models/`
2. Create API routes in `app/api/`
3. Create management page in `app/admin/`
4. Add navigation link in `app/admin/layout.tsx`

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env`
- Check MongoDB is running (if local)
- Ensure network access (if using Atlas)

### Image Upload Issues
- Currently using base64 encoding (stored in DB)
- For production, consider using cloud storage (S3, Cloudinary, etc.)

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

## 🚀 Production Deployment

1. Set up MongoDB Atlas for production
2. Add authentication system
3. Configure image storage (Cloudinary, S3)
4. Set up environment variables on hosting platform
5. Deploy to Vercel, Netlify, or your preferred platform

## 📄 License

This admin panel is part of the Maraksh Restaurant project.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using Next.js, MongoDB, and TailwindCSS
