# Performance Optimization Migration Guide

## Quick Start

This guide helps you update existing components to use the new performance optimizations.

---

## 1. Image Components Migration

### Replace `<img>` tags

**Find and replace across your codebase:**

#### Option A: Using Next.js Image (recommended)

```tsx
// BEFORE
<img src="/menu-item.jpg" alt="Coffee" width="400" height="300" />

// AFTER
import { NextOptimizedImage } from '@/components/NextOptimizedImage';

<NextOptimizedImage
  src="/menu-item.jpg"
  alt="Coffee"
  width={400}
  height={300}
  priority={false}
/>
```

#### Option B: Using Specialized Components

```tsx
// For product/menu images
import { OptimizedProductImage } from '@/components/NextOptimizedImage';

<OptimizedProductImage
  src="/menu-item.jpg"
  alt="Coffee"
  className="rounded-lg"
/>

// For avatars
import { OptimizedAvatar } from '@/components/NextOptimizedImage';

<OptimizedAvatar
  src="/user-avatar.jpg"
  alt="User"
  size={48}
/>

// For hero/banner images
import { OptimizedHeroImage } from '@/components/NextOptimizedImage';

<OptimizedHeroImage
  src="/hero-banner.jpg"
  alt="Restaurant"
  priority={true}
/>
```

### Replace Existing OptimizedImage

If you're already using the old `OptimizedImage` component:

```tsx
// BEFORE
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width="400px"
  height="300px"
/>

// AFTER
import { NextOptimizedImage } from '@/components/NextOptimizedImage';

<NextOptimizedImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
/>
```

**Key Differences:**
- Width/height are now numbers, not strings
- Better optimization with Next.js Image
- Automatic WebP/AVIF conversion

---

## 2. Component Lazy Loading

### Admin Components

Update admin pages to use lazy loading:

#### Dashboard Page

```tsx
// app/admin/page.tsx

// BEFORE
import EnhancedAdminDashboard from '@/components/EnhancedAdminDashboard';

export default function AdminPage() {
  return <EnhancedAdminDashboard />;
}

// AFTER
import { LazyEnhancedAdminDashboard } from '@/components/LazyComponents';

export default function AdminPage() {
  return <LazyEnhancedAdminDashboard />;
}
```

#### Analytics Page

```tsx
// app/admin/analytics/page.tsx

// BEFORE
import ComprehensiveAnalyticsDashboard from '@/components/ComprehensiveAnalyticsDashboard';

// AFTER
import { LazyComprehensiveAnalyticsDashboard } from '@/components/LazyComponents';
```

### Modal Components

```tsx
// BEFORE
import ReviewModal from '@/components/ReviewModal';

const [showModal, setShowModal] = useState(false);

{showModal && <ReviewModal onClose={() => setShowModal(false)} />}

// AFTER
import { LazyReviewModal } from '@/components/LazyComponents';

const [showModal, setShowModal] = useState(false);

{showModal && <LazyReviewModal onClose={() => setShowModal(false)} />}
```

### Custom Lazy Components

For components not in the LazyComponents list:

```tsx
import { createLazyComponent } from '@/components/LazyComponents';

const LazyMyComponent = createLazyComponent(
  () => import('./MyComponent'),
  {
    loadingMessage: 'Loading my component...',
    ssr: false, // Set to true if component can be server-rendered
  }
);

// Use it
<LazyMyComponent prop1="value" prop2="value" />
```

---

## 3. Font Usage Updates

### CSS Classes

**No changes needed!** Font variables are automatically applied.

Existing classes will work:

```tsx
<h1 className="arabic-title">عنوان</h1>
<p className="arabic-body">نص</p>
<h2 className="section-title">Section</h2>
```

### Custom Components

If you're using inline font families:

```tsx
// BEFORE
<div style={{ fontFamily: 'Cairo, sans-serif' }}>

// AFTER
<div style={{ fontFamily: 'var(--font-cairo), sans-serif' }}>
```

Or use Tailwind:

```tsx
<div className="font-['var(--font-cairo)']">
```

---

## 4. Component-by-Component Migration

### Menu Page (`app/menu/page.tsx`)

**Priority:** High (user-facing)

1. Replace product images with `OptimizedProductImage`
2. Lazy load `ReviewModal` if used
3. Ensure category images use optimized component

**Example:**

```tsx
// BEFORE
{items.map(item => (
  <div key={item.id}>
    <img src={item.image} alt={item.name} />
    <h3>{item.name}</h3>
  </div>
))}

// AFTER
import { OptimizedProductImage } from '@/components/NextOptimizedImage';

{items.map((item, index) => (
  <div key={item.id}>
    <OptimizedProductImage
      src={item.image}
      alt={item.name}
      priority={index < 3} // Prioritize first 3 items
    />
    <h3>{item.name}</h3>
  </div>
))}
```

### Admin Pages (`app/admin/**`)

**Priority:** Medium (authenticated users only)

1. Use `LazyEnhancedAdminDashboard`
2. Use `LazyComprehensiveAnalyticsDashboard`
3. Lazy load modals and panels

### Homepage (`app/page.tsx`)

**Priority:** High

1. Hero images should use `OptimizedHeroImage` with `priority={true}`
2. Below-the-fold content should be lazy loaded
3. Offers/reviews sliders use lazy components

**Example:**

```tsx
// app/page.tsx
import { OptimizedHeroImage } from '@/components/NextOptimizedImage';
import {
  LazyOffersSlider,
  LazyReviewsSlider,
  LazyJourneySection,
} from '@/components/LazyComponents';

export default function HomePage() {
  return (
    <>
      {/* Above the fold - prioritize */}
      <section className="hero">
        <OptimizedHeroImage
          src="/hero.jpg"
          alt="Restaurant"
          priority={true}
        />
        <h1>Welcome</h1>
      </section>

      {/* Below the fold - lazy load */}
      <LazyOffersSlider />
      <LazyReviewsSlider />
      <LazyJourneySection />
    </>
  );
}
```

---

## 5. Bulk Find & Replace Commands

### Using VS Code

**Replace all `<img>` tags:**

1. Open Find (Ctrl/Cmd + F)
2. Enable regex mode
3. Find: `<img\s+src="([^"]+)"\s+alt="([^"]+)"([^>]*)?>`
4. Manual replacement needed (cannot auto-replace complex patterns)

**Find all image imports:**

1. Search: `import.*Image.*from`
2. Review and update manually

### Using grep (command line)

```bash
# Find all files with <img> tags
grep -r "<img" app/ components/

# Find all files importing images
grep -r "from.*Image" app/ components/
```

---

## 6. Testing Migration

### Checklist

After migrating a component:

- [ ] No console errors
- [ ] Images load correctly
- [ ] Lazy loading works (check Network tab)
- [ ] Page performance is improved (Lighthouse)
- [ ] No layout shift (images have dimensions)
- [ ] Loading states appear correctly
- [ ] Mobile responsive

### Testing Tools

```bash
# Build and test
npm run build
npm start

# Open in browser and test:
# 1. Chrome DevTools > Network tab (check lazy loading)
# 2. Chrome DevTools > Lighthouse (run audit)
# 3. Chrome DevTools > Performance (record page load)
```

---

## 7. Common Issues & Solutions

### Issue: Image not displaying

**Cause:** Incorrect width/height
**Solution:**
```tsx
// BEFORE (strings)
width="400px" height="300px"

// AFTER (numbers)
width={400} height={300}
```

### Issue: Layout shift when images load

**Cause:** No dimensions specified
**Solution:**
```tsx
// Always specify dimensions or use fill mode
<NextOptimizedImage
  src="..."
  alt="..."
  width={400}
  height={300}
/>

// OR for responsive
<div className="relative h-64">
  <NextOptimizedImage
    src="..."
    alt="..."
    fill
    objectFit="cover"
  />
</div>
```

### Issue: Lazy component doesn't load

**Cause:** Import error or missing component
**Solution:**
```tsx
// Check if component exists
import { LazyMyComponent } from '@/components/LazyComponents';

// If not, create it:
import { createLazyComponent } from '@/components/LazyComponents';
const LazyMyComponent = createLazyComponent(
  () => import('./MyComponent')
);
```

### Issue: Fonts not loading

**Cause:** Missing font files or incorrect paths
**Solution:**
1. Check `app/fonts.ts` configuration
2. Download missing fonts to `public/fonts/`
3. Verify font paths are correct
4. Check browser console for 404 errors

---

## 8. Priority Order

Migrate in this order for maximum impact:

1. **Homepage hero images** (highest visibility)
2. **Menu page product images** (user-facing)
3. **Admin dashboard** (large bundle)
4. **Modal components** (on-demand)
5. **Below-the-fold content** (lazy load)
6. **Other pages** (as time permits)

---

## 9. Verification

After migration, verify improvements:

### Bundle Size

```bash
npm run build

# Check output:
# Route (app)              Size     First Load JS
# ┌ ○ /                    XXX kB         XXX kB
# ├ ○ /admin               XXX kB         XXX kB
# └ ○ /menu                XXX kB         XXX kB
```

**Target:** First Load JS < 500kB

### Lighthouse Score

1. Build: `npm run build && npm start`
2. Open page in Chrome
3. DevTools > Lighthouse > Analyze
4. **Target:** Performance 90+

### Core Web Vitals

- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1

---

## 10. Gradual Migration

**Don't need to migrate everything at once!**

### Phase 1 (Week 1)
- ✅ Homepage
- ✅ Menu page
- ✅ Critical images

### Phase 2 (Week 2)
- ✅ Admin dashboard
- ✅ Modal components
- ✅ Secondary pages

### Phase 3 (Week 3)
- ✅ Remaining pages
- ✅ Edge cases
- ✅ Testing & QA

---

## Need Help?

Refer to:
- `PERFORMANCE_OPTIMIZATION_GUIDE.md` - Detailed guide
- `OPTIMIZATION_SUMMARY.md` - Quick reference
- Component code examples above

---

**Last Updated:** 2025-10-15
**Version:** 1.0
