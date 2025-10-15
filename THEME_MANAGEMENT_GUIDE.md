# Theme Management System - Complete Guide

## Overview

This application has a complete theme management system that allows admins to customize the color scheme of the menu page. The system includes:

1. **MongoDB Storage** - Themes are persisted in the `SiteSettings` collection
2. **Dedicated API Endpoints** - `/api/theme` for theme-specific operations
3. **React Context** - `ThemeContext` for reactive, real-time theme updates
4. **Admin Interface** - Theme customization panel in the admin dashboard
5. **Server-Side Rendering** - Theme is applied server-side to prevent FOUC (Flash of Unstyled Content)

---

## Architecture

### Database Layer

**Model**: `lib/models/SiteSettings.ts`

The theme is stored as part of the `SiteSettings` document with the following structure:

```typescript
{
  _id: ObjectId,
  logoUrl: string,
  logoPosition: 'left' | 'center' | 'right',
  theme: {
    background?: string,
    foreground?: string,
    primary?: string,
    secondary?: string,
    accent?: string,
    card?: string,
    'card-foreground'?: string,
    muted?: string,
    'muted-foreground'?: string,
    ring?: string,
    'scroll-thumb-start'?: string,
    'scroll-thumb-end'?: string,
    'scroll-track'?: string
  },
  updatedAt: Date
}
```

### API Layer

#### `/api/theme` (Recommended)

Dedicated theme API endpoints:

**GET /api/theme**
- Fetches the current theme
- Returns: `{ success: boolean, theme: Theme | null }`
- Example:
  ```javascript
  const response = await fetch('/api/theme');
  const { success, theme } = await response.json();
  ```

**PUT /api/theme**
- Updates the theme (admin only)
- Body: `{ theme: { background: '#FFFFFF', ... } }` or `{ resetTheme: true }`
- Returns: `{ success: boolean, theme: Theme | null }`
- Example:
  ```javascript
  const response = await fetch('/api/theme', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      theme: {
        primary: '#FF0000',
        secondary: '#00FF00'
      }
    })
  });
  ```

#### `/api/site-settings` (Legacy)

Full site settings API that includes theme:

**GET /api/site-settings**
- Returns: `{ success: boolean, data: SiteSettings }`

**PUT /api/site-settings**
- Body can include `theme` or other site settings
- Example:
  ```javascript
  await fetch('/api/site-settings', {
    method: 'PUT',
    body: JSON.stringify({
      theme: { primary: '#FF0000' }
    })
  });
  ```

### Context Layer

**File**: `contexts/ThemeContext.tsx`

Provides reactive theme management throughout the application:

```typescript
interface ThemeContextType {
  theme: Theme | null;
  loading: boolean;
  error: string | null;
  updateTheme: (newTheme: Theme) => Promise<boolean>;
  resetTheme: () => Promise<boolean>;
  refetchTheme: () => Promise<void>;
}
```

**Usage**:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, updateTheme, resetTheme, loading } = useTheme();

  const handleSave = async () => {
    const success = await updateTheme({
      primary: '#FF0000',
      secondary: '#00FF00'
    });
    if (success) {
      console.log('Theme updated!');
    }
  };

  return (
    <div>
      {loading ? 'Loading...' : `Current primary: ${theme?.primary}`}
      <button onClick={handleSave}>Save Theme</button>
      <button onClick={resetTheme}>Reset Theme</button>
    </div>
  );
}
```

### UI Layer

**Admin Panel**: `components/EnhancedAdminDashboard.tsx`

- Located in the "ألوان القائمة" (Theme Colors) tab of the settings modal
- Provides 13 color pickers for all theme properties
- Live preview of changes
- Save and reset functionality

---

## Color Format

The system supports two color formats:

1. **HEX Format** (e.g., `#FF0000`)
   - Stored as-is in MongoDB
   - Automatically converted to HSL triplet for CSS variables

2. **HSL Triplet** (e.g., `240 100% 50%`)
   - Used directly as CSS variable values
   - Compatible with Tailwind CSS

**Conversion**:
When colors are applied to the DOM, HEX colors are automatically converted to HSL triplets:
- `#FF0000` → `0 100% 50%`
- Applied as: `--primary: 0 100% 50%`

---

## Theme Properties

| Property | Description | Default Value |
|----------|-------------|---------------|
| `background` | Page background color | `#F6EEDF` |
| `foreground` | Primary text color | `#4F3500` |
| `primary` | Primary brand color | `#9C6B1E` |
| `secondary` | Secondary brand color | `#D3A34C` |
| `accent` | Accent color for highlights | `#1EA55E` |
| `card` | Card background color | `#4F3500` |
| `card-foreground` | Card text color | `#FFFFFF` |
| `muted` | Muted background color | `rgba(0,0,0,0.12)` |
| `muted-foreground` | Muted text color | `rgba(18,15,6,0.7)` |
| `ring` | Focus ring color | `#D3A34C` |
| `scroll-thumb-start` | Scrollbar thumb gradient start | `#1EA55E` |
| `scroll-thumb-end` | Scrollbar thumb gradient end | `#D3A34C` |
| `scroll-track` | Scrollbar track color | `rgba(0,0,0,0.25)` |

---

## Implementation Details

### 1. Fixed Issues

#### Issue: Theme Not Saving to MongoDB

**Root Cause**:
- Mongoose was not including `undefined` or empty theme fields in responses
- The API route was using `.toJSON()` which stripped undefined fields

**Solution**:
1. Updated `SiteSettings` model to use `toObject()` transform
2. Changed API routes to use `.lean()` for plain JavaScript objects
3. Added explicit theme field handling in responses

#### Issue: Theme Not Updating Reactively

**Root Cause**:
- No centralized state management for theme
- Components were fetching theme independently

**Solution**:
1. Created `ThemeContext` with React Context API
2. Wrapped app in `ThemeProvider` in root layout
3. Updated admin dashboard to use `useTheme()` hook
4. Automatic DOM updates when theme changes

### 2. Server-Side Rendering (SSR)

The theme is fetched and applied server-side in `app/layout.tsx` to prevent FOUC:

```tsx
// Fetch theme on server
const settings = await SiteSettings.getSettings();
const theme = settings?.theme;

// Convert to CSS variables
const themeVars = convertThemeToCSSVars(theme);

// Inject as inline <style> in <head>
<style dangerouslySetInnerHTML={{ __html: `:root{${themeVars}}` }} />
```

### 3. Client-Side Updates

The `ThemeContext` automatically applies theme changes to the DOM:

```typescript
function applyThemeToDOM(theme: Theme | null) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    const hslValue = convertToHSL(value);
    root.style.setProperty(`--${key}`, hslValue);
  });
}
```

---

## Testing

### Manual Testing via Admin Panel

1. Navigate to `/admin`
2. Click "الإعدادات" (Settings) button
3. Click "ألوان القائمة" (Theme Colors) tab
4. Modify any color using the color pickers
5. Click "حفظ" (Save) to save changes
6. Navigate to `/menu` to see changes applied
7. Click "استعادة الافتراضي" (Reset to Default) to revert

### API Testing

**Test Theme Save**:
```bash
curl -X PUT http://localhost:3000/api/theme \
  -H "Content-Type: application/json" \
  -d '{
    "theme": {
      "primary": "#FF0000",
      "secondary": "#00FF00"
    }
  }'
```

**Test Theme Fetch**:
```bash
curl http://localhost:3000/api/theme
```

**Test Theme Reset**:
```bash
curl -X PUT http://localhost:3000/api/theme \
  -H "Content-Type: application/json" \
  -d '{"resetTheme": true}'
```

### Automated Testing

Run the included test script:

```bash
# Test direct MongoDB operations
node test-theme-save.js

# Test API endpoints (requires dev server running)
node test-api-theme.js
```

---

## Troubleshooting

### Theme Changes Not Appearing

**Symptoms**: Changes saved in admin panel don't show on menu page

**Possible Causes**:
1. **Browser Cache**: Hard refresh the page (Ctrl+Shift+R)
2. **Server Cache**: Restart the Next.js dev server
3. **MongoDB Connection**: Check database connectivity

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev

# Check MongoDB
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e));"
```

### Theme Not Persisting

**Symptoms**: Theme resets after page reload

**Check**:
1. Verify MongoDB document:
   ```bash
   node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const doc = await mongoose.connection.db.collection('sitesettings').findOne(); console.log(JSON.stringify(doc, null, 2)); await mongoose.connection.close(); });"
   ```

2. Check API response includes theme:
   ```bash
   curl http://localhost:3000/api/theme
   ```

3. Verify `markModified()` is called before save:
   ```typescript
   settings.theme = newTheme;
   settings.markModified('theme'); // Required for Mixed types
   await settings.save();
   ```

### Colors Look Different Than Expected

**Issue**: HEX colors appear different when applied

**Reason**: Colors are converted from HEX to HSL triplet format

**Solution**: Use HSL values directly if exact color matching is critical:
```javascript
// Instead of:
{ primary: '#FF0000' }

// Use:
{ primary: '0 100% 50%' } // H S% L% format
```

---

## Best Practices

### 1. Always Use ThemeContext

**Good**:
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  return <div>Primary: {theme?.primary}</div>;
}
```

**Avoid**:
```tsx
// Don't fetch theme directly
const [theme, setTheme] = useState(null);
useEffect(() => {
  fetch('/api/theme').then(/* ... */);
}, []);
```

### 2. Validate Colors Before Saving

```typescript
const isValidHex = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);
const isValidHSL = (color: string) => /^\d+\s+\d+%\s+\d+%$/.test(color);

if (!isValidHex(newColor) && !isValidHSL(newColor)) {
  console.error('Invalid color format');
  return;
}
```

### 3. Handle Loading States

```tsx
const { theme, loading, error } = useTheme();

if (loading) return <Spinner />;
if (error) return <Error message={error} />;
if (!theme) return <DefaultTheme />;

return <ThemedComponent theme={theme} />;
```

### 4. Use Fallback Colors

```tsx
const primaryColor = theme?.primary || '#9C6B1E'; // Fallback to default
```

---

## File Structure

```
├── app/
│   ├── api/
│   │   ├── theme/
│   │   │   └── route.ts              # Dedicated theme API
│   │   └── site-settings/
│   │       └── route.ts              # Legacy site settings API
│   └── layout.tsx                    # Root layout with SSR theme
├── components/
│   ├── EnhancedAdminDashboard.tsx    # Admin theme editor
│   └── admin/
│       └── ColorPicker.tsx           # Color picker component
├── contexts/
│   └── ThemeContext.tsx              # Theme context provider
├── lib/
│   └── models/
│       └── SiteSettings.ts           # MongoDB model
├── test-theme-save.js                # MongoDB test script
├── test-api-theme.js                 # API test script
└── THEME_MANAGEMENT_GUIDE.md         # This file
```

---

## Migration Guide

### From Old System to New System

If you have existing code using the old `/api/site-settings` approach:

**Before**:
```tsx
const [theme, setTheme] = useState(null);

useEffect(() => {
  fetch('/api/site-settings')
    .then(res => res.json())
    .then(data => setTheme(data.data.theme));
}, []);

const updateTheme = async (newTheme) => {
  await fetch('/api/site-settings', {
    method: 'PUT',
    body: JSON.stringify({ theme: newTheme })
  });
};
```

**After**:
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, updateTheme, loading } = useTheme();

// That's it! No manual fetching needed
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for errors
3. Verify MongoDB connection and document structure
4. Test API endpoints directly with curl/Postman

---

## Changelog

### Version 2.0 (Current)
- ✅ Fixed theme not saving to MongoDB
- ✅ Created dedicated `/api/theme` endpoints
- ✅ Added `ThemeContext` for reactive updates
- ✅ Integrated ThemeProvider in root layout
- ✅ Updated admin dashboard to use context
- ✅ Added proper error handling
- ✅ Improved color conversion (HEX to HSL)
- ✅ Added comprehensive documentation

### Version 1.0 (Previous)
- Basic theme support via `/api/site-settings`
- Manual theme fetching in components
- No reactive updates
- Theme save issues with Mongoose

---

**Last Updated**: 2025-10-15
**Author**: Claude Code Assistant
