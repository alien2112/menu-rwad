# Testing Guide - Caching & Fresh Data

## 🧪 How to Test All Fixes

### Test 1: Admin Homepage - Fresh Data
1. Navigate to `/admin/homepage`
2. Open DevTools → Network tab
3. Click on a filter (e.g., "مشروباتنا المميزة")
4. Check the network request:
   ```
   Request URL: /api/signature-drinks?admin=true&_t=1234567890
   Request Headers: Cache-Control: no-cache, no-store
   ```
5. **Expected:** Fresh data loaded immediately

---

### Test 2: Add Signature Drink
1. Go to `/admin/homepage`
2. Click "إضافة صورة جديدة"
3. Fill in:
   - Section: مشروباتنا المميزة
   - Title (Arabic): قهوة جديدة
   - Title (English): New Coffee
   - Upload an image
4. Click "إضافة"
5. **Expected:**
   - ✅ Modal closes
   - ✅ New drink appears in the list immediately
   - ✅ No page refresh needed

---

### Test 3: Update Signature Drink
1. In `/admin/homepage`
2. Click edit (✏️) on any drink
3. Change the title to "Updated Title"
4. Click "تحديث"
5. **Expected:**
   - ✅ Changes appear immediately
   - ✅ Database updated
   - ✅ Public homepage will show new title after revalidation

---

### Test 4: Delete Signature Drink
1. In `/admin/homepage`
2. Click delete (🗑️) on any drink
3. Confirm deletion
4. **Expected:**
   - ✅ Item removed from list immediately
   - ✅ No ghost items
   - ✅ Database updated

---

### Test 5: Category CRUD (Main Issue)
**Add Category:**
1. Go to `/admin/categories`
2. Click "إضافة فئة جديدة"
3. Fill in details
4. Submit
5. **Expected:** New category appears immediately in admin list

**Update Category:**
1. Edit any category
2. Change name
3. Save
4. **Expected:** Updated name shows immediately

**Delete Category:**
1. Delete a category
2. **Expected:** Category removed immediately from admin

---

### Test 6: Public Site Revalidation
**After admin changes:**
1. Make a change in admin (add/edit/delete category)
2. Open `/menu` in a new incognito window
3. **Expected:**
   - Public page shows updated data
   - May take 1-2 seconds for revalidation
   - Subsequent visits are instant (cached)

---

### Test 7: Cache Verification

**Admin Request:**
```javascript
// Open DevTools Console on admin page
// Check fetch requests
fetch('/api/categories?admin=true')
  .then(r => r.headers.get('cache-control'))
  .then(console.log);
// Expected: "no-store, no-cache, must-revalidate, max-age=0"
```

**Public Request:**
```javascript
// Open DevTools Console on public page
fetch('/api/categories')
  .then(r => r.headers.get('cache-control'))
  .then(console.log);
// Expected: "public, s-maxage=60, stale-while-revalidate=120"
```

---

### Test 8: Verify No Stale Data

**Admin Test:**
1. Open `/admin/homepage` in two browser tabs
2. In Tab 1: Add a new signature drink
3. In Tab 2: Click any filter button
4. **Expected:** Tab 2 shows the new drink (fresh fetch)

---

### Test 9: Browser Cache Busting

**Check timestamp:**
1. Open DevTools → Network
2. Perform any action in admin that fetches data
3. Look at request URL
4. **Expected:** URL contains `_t=1234567890` (timestamp)
5. **Result:** Each request has unique timestamp = no browser cache

---

### Test 10: Public Performance

**Verify caching still works for public:**
1. Open public homepage
2. Open DevTools → Network
3. Refresh page
4. Check `/api/categories` request
5. **Expected:**
   - First load: `X-Cache-Status: MISS`
   - Second load (within 60s): `X-Cache-Status: HIT`
   - Fast response times

---

## 🔍 Common Issues & Solutions

### Issue 1: Changes Not Appearing in Admin
**Solution:**
- Check Network tab
- Verify `?admin=true` parameter is present
- Verify `cache: 'no-store'` in request
- Check `_t` timestamp is changing

### Issue 2: Public Site Not Updating
**Solution:**
- Wait 1-2 seconds after admin change
- Check if `revalidatePath()` is called in API
- Clear browser cache manually if needed
- Check server logs for revalidation

### Issue 3: 500 Error on Mutation
**Solution:**
- Check MongoDB connection
- Verify all required fields sent
- Check server console for error details

---

## ✅ Success Criteria

### Admin Dashboard
- [ ] Add category → appears immediately
- [ ] Update category → changes show immediately
- [ ] Delete category → removed immediately
- [ ] Add signature drink → appears immediately
- [ ] Update signature drink → changes show immediately
- [ ] Delete signature drink → removed immediately
- [ ] No page refresh needed for any operation
- [ ] No stale data shown

### Public Site
- [ ] Categories updated after admin changes
- [ ] Homepage updated after signature drink changes
- [ ] Fast load times (cached)
- [ ] No 404 errors
- [ ] Images load correctly

### Cache Behavior
- [ ] Admin requests bypass cache
- [ ] Public requests use cache
- [ ] Mutations invalidate cache
- [ ] revalidatePath works correctly

---

## 🎯 Quick Test Script

Run this in browser console on admin page:

```javascript
// Test 1: Check admin mode
const testAdminMode = async () => {
  const res = await fetch('/api/categories?admin=true&_t=' + Date.now(), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  const cacheControl = res.headers.get('cache-control');
  console.log('Admin Cache-Control:', cacheControl);
  console.log('✅ Should be: no-store, no-cache, must-revalidate, max-age=0');
};

// Test 2: Check public mode
const testPublicMode = async () => {
  const res = await fetch('/api/categories');
  const cacheControl = res.headers.get('cache-control');
  const cacheStatus = res.headers.get('x-cache-status');
  console.log('Public Cache-Control:', cacheControl);
  console.log('Public Cache-Status:', cacheStatus);
  console.log('✅ Should be: public, s-maxage=60, stale-while-revalidate=120');
  console.log('✅ Cache-Status should be: HIT or MISS');
};

// Run tests
testAdminMode();
testPublicMode();
```

---

## 📊 Expected Network Activity

### Admin Add/Update/Delete
```
1. POST/PUT/DELETE /api/categories/[id]
   Request Headers: Content-Type: application/json
   Response Headers: Cache-Control: no-store

2. GET /api/categories?admin=true&_t=123456
   Request Headers: Cache-Control: no-cache
   Response Headers: Cache-Control: no-store, max-age=0
   Status: 200

3. UI updates immediately ✅
```

### Public Page Visit
```
1. GET /api/categories
   Response Headers: Cache-Control: public, s-maxage=60
   Response Headers: X-Cache-Status: MISS (first time)
   Status: 200

2. GET /api/categories (within 60s)
   Response Headers: X-Cache-Status: HIT
   Status: 200 (served from cache) ✅
```

---

## 🐛 Debugging Checklist

If issues persist:

1. **Check MongoDB Connection**
   ```bash
   # Check if MongoDB is running
   # Check MONGODB_URI in .env
   ```

2. **Clear All Caches**
   ```javascript
   // In browser console
   caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Restart Next.js Server**
   ```bash
   # Kill and restart
   npm run dev
   ```

4. **Check Server Logs**
   - Look for "Admin Homepage" logs
   - Check for cache HIT/MISS logs
   - Verify revalidation logs

5. **Verify Environment**
   ```bash
   # Check .env file
   MONGODB_URI=mongodb://...
   ```

---

**All tests should pass ✅**
**If any test fails, check the specific section in CACHING-FIX-REPORT.md**
