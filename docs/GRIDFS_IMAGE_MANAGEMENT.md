# 🖼️ GridFS Image Management System

Complete MongoDB GridFS integration for managing homepage images with full admin control.

## ✨ Features Implemented

### 🗄️ **GridFS Storage**
- ✅ All images stored in MongoDB using GridFS
- ✅ Efficient binary file storage
- ✅ Automatic file chunking for large images
- ✅ Scalable storage solution

### 📱 **Homepage Image Management**
Manage images for three main sections:

1. **Signature Drinks** (`signature-drinks`)
   - Horizontal slider with image carousel
   - Multiple drinks with titles and descriptions

2. **Special Offers** (`offers`)
   - Vertical slider with full card slides
   - Each card includes image + title + description
   - Smart up/down navigation buttons

3. **Our Journey** (`journey`)
   - Journey section images with left/right positioning
   - Support for alternating image layouts

### 🎛️ **Admin Panel**
New "Homepage" section in admin at `/admin/homepage`

#### Features:
- Upload images directly to GridFS
- Manage all homepage sections in one place
- Filter by section (Signature Drinks, Offers, Journey)
- Full CRUD operations (Create, Read, Update, Delete)
- Preview images before upload
- Set order, titles (AR/EN), descriptions (AR/EN)
- Position control for journey images (left/right)

## 📁 Project Structure

```
lib/
├── gridfs.ts                    # GridFS utilities
└── models/
    └── HomepageImage.ts         # Homepage image model

app/
├── admin/
│   └── homepage/
│       └── page.tsx             # Admin page for image management
│
└── api/
    ├── homepage/
    │   ├── route.ts             # GET all images, filter by section
    │   └── [id]/route.ts        # GET, PUT, DELETE by ID
    ├── upload/
    │   └── route.ts             # POST upload image to GridFS
    └── images/
        └── [id]/route.ts        # GET image from GridFS (serves binary)

components/
├── SignatureDrinksSlider.tsx    # Updated to fetch from DB
└── OffersSlider.tsx             # Updated to fetch from DB
```

## 🚀 Usage

### 1. Admin Upload Workflow

```typescript
// Navigate to /admin/homepage
// 1. Click "إضافة صورة جديدة" (Add New Image)
// 2. Select section: signature-drinks, offers, or journey
// 3. Upload image (PNG, JPG, GIF)
// 4. Fill in title (Arabic required, English optional)
// 5. Add description (optional)
// 6. Set order number
// 7. For journey section: choose left/right position
// 8. Click "إضافة" (Add)
```

### 2. Frontend Display

Images automatically appear in the respective sliders on the homepage:

```typescript
// Signature Drinks - Horizontal Slider
- Fetches: /api/homepage?section=signature-drinks
- Displays in: components/SignatureDrinksSlider.tsx

// Offers - Vertical Slider
- Fetches: /api/homepage?section=offers
- Displays in: components/OffersSlider.tsx

// Journey Section (To be implemented)
- Fetches: /api/homepage?section=journey
```

## 📊 Database Schema

### HomepageImage Model

```typescript
{
  section: 'signature-drinks' | 'offers' | 'journey',
  title: string,                    // Arabic title (required)
  titleEn?: string,                 // English title
  description?: string,             // Arabic description
  descriptionEn?: string,           // English description
  imageId: string,                  // GridFS file ID
  imageUrl?: string,                // Optional CDN URL
  order: number,                    // Display order
  status: 'active' | 'inactive',
  journeyPosition?: 'left' | 'right', // For journey section
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Reference

### Upload Image
```http
POST /api/upload
Content-Type: multipart/form-data

FormData:
  - file: File (required)
  - section: string (required)
  - title: string (required)
  - titleEn: string (optional)
  - description: string (optional)
  - descriptionEn: string (optional)
  - order: number (default: 0)
  - journeyPosition: 'left' | 'right' (for journey section)
```

### Get Images
```http
GET /api/homepage
GET /api/homepage?section=signature-drinks
GET /api/homepage?section=offers
GET /api/homepage?section=journey
```

### Get Single Image Metadata
```http
GET /api/homepage/:id
```

### Update Image Metadata
```http
PUT /api/homepage/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "order": 1
}
```

### Delete Image
```http
DELETE /api/homepage/:id
```

### Serve Image Binary
```http
GET /api/images/:imageId
```

## 🎨 GridFS Utilities

### Upload to GridFS
```typescript
import { uploadToGridFS } from '@/lib/gridfs';

const fileId = await uploadToGridFS(
  buffer,      // Buffer
  filename,    // string
  contentType  // string (e.g., 'image/jpeg')
);
```

### Download from GridFS
```typescript
import { getFromGridFS } from '@/lib/gridfs';

const { stream, contentType } = await getFromGridFS(fileId);
```

### Delete from GridFS
```typescript
import { deleteFromGridFS } from '@/lib/gridfs';

await deleteFromGridFS(fileId);
```

## 🔧 Configuration

### MongoDB Connection
Ensure your MongoDB URI is set in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### GridFS Bucket
Default bucket name: `images`

To change, edit `lib/gridfs.ts`:
```typescript
const gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
  bucketName: 'your-custom-bucket-name',
});
```

## 📈 Performance Considerations

### Caching
Images are served with cache headers:
```typescript
{
  'Cache-Control': 'public, max-age=31536000, immutable'
}
```

### Optimization Tips
1. **Compress images** before upload (use tools like TinyPNG)
2. **Set appropriate dimensions** (max 1920x1080 recommended)
3. **Use WebP format** for better compression
4. **Consider CDN** for production (store imageUrl alongside imageId)

## 🚀 Future Enhancements

- [ ] Image compression on upload
- [ ] Multiple image sizes (thumbnail, medium, large)
- [ ] Bulk upload functionality
- [ ] Image cropping tool
- [ ] CDN integration (Cloudinary, AWS S3)
- [ ] Image optimization pipeline
- [ ] Journey section component implementation
- [ ] Analytics tracking for image views

## 🔒 Security

### Current Implementation
- File type validation (images only)
- MongoDB authentication required
- No direct file system access

### Recommended Production Security
1. Add file size limits (e.g., 10MB max)
2. Implement virus scanning
3. Add rate limiting on upload endpoint
4. Validate image dimensions
5. Sanitize filenames
6. Add authentication middleware
7. Implement RBAC (Role-Based Access Control)

## 🐛 Troubleshooting

### Images not displaying?
1. Check MongoDB connection
2. Verify GridFS bucket exists
3. Check browser console for 404 errors
4. Ensure imageId is correct in database

### Upload failing?
1. Check file size (default Next.js limit: 4.5MB)
2. Verify file type is image/*
3. Check MongoDB storage space
4. Review server logs for errors

### Slow image loading?
1. Implement image caching
2. Use CDN for serving
3. Compress images before upload
4. Consider lazy loading

## 📝 Example Usage

### Adding Signature Drink Images

1. Go to `/admin/homepage`
2. Click "+ إضافة صورة جديدة"
3. Select section: "مشروباتنا المميزة" (signature-drinks)
4. Upload coffee image
5. Title (AR): "قهوة تركية فاخرة"
6. Title (EN): "Premium Turkish Coffee"
7. Order: 0 (first)
8. Click "إضافة"

### Adding Offer Images

1. Same process but select "العروض الخاصة" (offers)
2. Add description: "خصم 25% على جميع المشروبات"
3. Set order to control vertical position in slider

---

**Built with ❤️ using Next.js, MongoDB GridFS, and TailwindCSS**
