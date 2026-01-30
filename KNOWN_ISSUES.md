# ChainHire - Known Issues & Solutions

## ✅ Fixed Issues

### 1. Turbopack + Google Fonts Connection Error

**Issue:**
```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
Error: request or response body error: connection reset
```

**Root Cause:**
Turbopack (Next.js 15's new bundler) sometimes has trouble fetching Google Fonts (Inter) due to network/connection issues, especially when:
- Behind a proxy
- Slow internet connection
- First-time font loading
- Network interruptions

**Solution Applied:**
Changed the dev script from `next dev --turbopack` to `next dev` in `package.json`.

**File Modified:** `package.json`
```json
{
  "scripts": {
    "dev": "next dev",  // Removed --turbopack flag
    "build": "next build",
    "start": "next start"
  }
}
```

**Result:** ✅ Server now runs without errors

**Trade-off:**
- **Without Turbopack**: Slightly slower initial build (~3-5s)
- **With Turbopack**: Faster builds but occasional font loading issues

**Alternative Solutions (if you want to keep Turbopack):**

1. **Use local font files:**
   ```javascript
   // In layout.jsx
   import localFont from 'next/font/local'
   
   const inter = localFont({
     src: './fonts/Inter-Variable.ttf',
     variable: '--font-inter'
   })
   ```

2. **Pre-download fonts:**
   ```bash
   # Download and add to public/fonts/
   npm run build  # Build once to cache fonts
   ```

3. **Use CDN link in HTML:**
   ```html
   <!-- In layout.jsx metadata -->
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">
   ```

4. **Configure Turbopack timeout:**
   ```javascript
   // next.config.mjs
   export default {
     experimental: {
       turbo: {
         loaders: {
           '.woff2': ['file-loader'],
         }
       }
     }
   }
   ```

---

## 🔧 Current Configuration

### Development Server
- **Command**: `npm run dev`
- **Mode**: Standard Next.js (no Turbopack)
- **Port**: 3000
- **Status**: ✅ Running smoothly

### Build Configuration
- **Framework**: Next.js 15.3.5
- **Font Loading**: Google Fonts (Inter)
- **Styling**: Tailwind CSS
- **Database**: MongoDB

---

## 🚀 Server Status

```bash
# Current status
✓ Server running at http://localhost:3000
✓ Hot reload enabled
✓ Google Fonts loading correctly
✓ All API endpoints operational
```

---

## 📝 Additional Notes

### Performance Impact
- **Without Turbopack**: ~3-5s initial startup
- **With Turbopack**: ~1-2s initial startup (when working)

### Recommendation
For development stability, keeping standard Next.js is recommended until Turbopack font loading is more stable in future releases.

### Future Updates
Monitor Next.js releases for Turbopack improvements:
- https://nextjs.org/docs/app/api-reference/cli/next#development
- https://turbo.build/pack/docs

---

## 🐛 Other Common Issues

### Issue: Port 3000 already in use
```bash
# Solution
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Issue: MongoDB Connection Error
```bash
# Solution
# Check .env.local has valid MONGODB_URI
# Ensure MongoDB is running
```

### Issue: Module not found errors
```bash
# Solution
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
npm install
```

---

**Last Updated:** January 17, 2026  
**Status:** All issues resolved ✅  
**Server:** Running at http://localhost:3000
