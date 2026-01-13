# Mobile Cookie & Session Troubleshooting Guide
## Fixing Session Expiration on Mobile Browsers

---

## The Problem

Users report that **sessions expire immediately** when using PromptLingo on mobile browsers (iPhone Safari, Chrome on iOS/Android), but it works fine on desktop.

**Symptoms:**
- User logs in successfully
- Immediately redirected to login page
- Session appears to last only seconds
- Works perfectly on desktop browsers

**Root Cause:**
Mobile browsers (especially Safari on iOS) have **very strict cookie policies** for cross-origin requests, even with `sameSite: 'none'` and `secure: true`.

---

## Why Mobile Browsers Block Cookies

### 1. Safari's Intelligent Tracking Prevention (ITP)
- Safari on iOS 11+ blocks third-party cookies by default
- Even with correct cookie settings, Safari may still block
- Affects both Safari and Chrome on iOS (since Chrome uses Safari's WebKit engine)

### 2. In-App Browsers Are Worse
- Instagram, Facebook, TikTok in-app browsers block all third-party cookies
- No workaround exists for in-app browsers

###3. Cookie Domain Mismatch
- Frontend: `https://www.promptlingo.ai` (Netlify)
- Backend: `https://promptlingo-backend.onrender.com` (Render)
- These are **different origins**, requiring cross-origin cookies

---

## Current Configuration (Correct)

```javascript
// server/controllers/authController.js
function setAuthCookies(res, accessToken, refreshToken, req) {
  const cookieConfig = {
    httpOnly: true,          // ✅ Prevents JavaScript access
    secure: true,            // ✅ HTTPS-only (production)
    sameSite: 'none',        // ✅ Allows cross-origin
    // No domain set          // ✅ Uses backend's actual domain
  };

  res.cookie('accessToken', accessToken, {
    ...cookieConfig,
    maxAge: 15 * 60 * 1000   // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieConfig,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}
```

```javascript
// Frontend: src/services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,     // ✅ Send cookies with requests
});

// All fetch calls
const response = await fetch(url, {
  credentials: 'include'     // ✅ Send cookies with fetch requests
});
```

**This configuration is correct!** The problem is Safari's ITP doesn't care.

---

## Debugging Steps

### Step 1: Test Cookie Support

Visit these endpoints from your mobile browser:

**1. Test Cookie Setting:**
```
GET https://promptlingo-backend.onrender.com/api/debug/test-cookie
```

**2. Verify Cookie Was Received:**
```
GET https://promptlingo-backend.onrender.com/api/debug/verify-cookie
```

**Expected Results:**
- Desktop: ✅ "Cookies are working correctly!"
- Mobile Safari: ❌ "Cookies NOT working - browser may be blocking them"

### Step 2: Check Session Status

```
GET https://promptlingo-backend.onrender.com/api/debug/session
```

**Returns:**
```json
{
  "hasCookies": false,  // ❌ On mobile Safari
  "hasAccessToken": false,
  "deviceInfo": {
    "isMobile": true,
    "isSafari": true,
    "isInAppBrowser": false
  }
}
```

### Step 3: Check Backend Logs

After logging in on mobile, check Render logs for:
```
🍪 [AUTH] Cookies set: {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: 'auto',
  environment: 'production',
  isMobile: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS...'
}
```

This confirms cookies are being set correctly server-side.

### Step 4: Check Browser Developer Tools (Mobile)

**On iOS Safari:**
1. Connect iPhone to Mac via USB
2. Open Safari on Mac → Develop → [Your iPhone] → [Safari]
3. Go to Storage tab → Cookies
4. Check if `accessToken` and `refreshToken` exist

**Expected:**
- Desktop: ✅ Both cookies visible
- Mobile: ❌ Cookies missing or immediately deleted

---

## Solutions (Ranked by Effort)

### ✅ Solution 1: Use Same Domain for Frontend & Backend (BEST)

**Problem:** Frontend and backend on different domains triggers Safari ITP.

**Fix:** Deploy backend on a subdomain of promptlingo.ai

**Current Setup:**
- Frontend: `https://www.promptlingo.ai` (Netlify)
- Backend: `https://promptlingo-backend.onrender.com` (Render)

**Target Setup:**
- Frontend: `https://www.promptlingo.ai` (Netlify)
- Backend: `https://api.promptlingo.ai` (Render with custom domain)

**Steps:**
1. In your DNS provider (where you bought promptlingo.ai), add CNAME record:
   ```
   api.promptlingo.ai → promptlingo-backend.onrender.com
   ```

2. In Render dashboard:
   - Go to your backend service
   - Settings → Custom Domains
   - Add: `api.promptlingo.ai`
   - Wait for SSL certificate to provision

3. Update frontend `.env.production`:
   ```
   REACT_APP_API_URL=https://api.promptlingo.ai
   ```

4. Update backend cookie settings (optional, for extra insurance):
   ```javascript
   domain: isProduction ? '.promptlingo.ai' : undefined,
   ```

**Why This Works:**
- Both frontend and backend now on `*.promptlingo.ai`
- Safari treats this as "same site" (not cross-origin)
- Cookies work normally

**Cost:** Free (just DNS config)
**Effort:** 15 minutes
**Success Rate:** 95%

---

### ✅ Solution 2: Store Tokens in localStorage (LESS SECURE)

**Problem:** Safari blocks HttpOnly cookies.

**Fix:** Store tokens in localStorage instead of cookies.

**Security Trade-off:**
- ❌ Vulnerable to XSS attacks (JavaScript can steal tokens)
- ✅ Works on all mobile browsers
- ✅ Works in in-app browsers

**Implementation:**

**Backend:** Return tokens in response body instead of cookies
```javascript
// server/controllers/authController.js
const login = async (req, res) => {
  // ... existing code ...

  // DON'T set cookies anymore
  // setAuthCookies(res, accessToken, refreshToken, req);

  // Return tokens in response
  return successResponse(res, {
    user: { /* user data */ },
    accessToken,    // Send token to frontend
    refreshToken,
    expiresIn: 900
  }, 'Login successful', 200);
};
```

**Frontend:** Store tokens in localStorage
```javascript
// src/services/authService.ts
export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email, password
    });

    const { accessToken, refreshToken, user } = response.data.data;

    // Store tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  }
};
```

**Send tokens with every request:**
```javascript
// src/services/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Cost:** Free
**Effort:** 2-3 hours of refactoring
**Success Rate:** 100% (works everywhere)
**Security:** ⚠️ Lower (XSS vulnerable)

---

### ✅ Solution 3: Hybrid Approach (BEST OF BOTH)

Use cookies on desktop, localStorage on mobile.

**Implementation:**
```javascript
// Frontend: src/utils/tokenStorage.ts
const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);

export const tokenStorage = {
  useLocalStorage: isMobile || isSafari,

  setTokens(accessToken, refreshToken) {
    if (this.useLocalStorage) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      console.log('📱 Using localStorage (mobile/Safari detected)');
    } else {
      // Tokens will be in HttpOnly cookies
      console.log('🍪 Using cookies (desktop)');
    }
  },

  getAccessToken() {
    if (this.useLocalStorage) {
      return localStorage.getItem('accessToken');
    }
    return null; // Cookies sent automatically
  }
};
```

**Cost:** Free
**Effort:** 3-4 hours
**Success Rate:** 100%
**Security:** ✅ Secure on desktop, ⚠️ less secure on mobile (acceptable trade-off)

---

### ❌ Solution 4: Ask Users to Enable Cookies (NOT RECOMMENDED)

**Why Not:**
- Poor user experience
- Most users won't know how
- Safari ITP ignores manual settings
- Loses 50%+ of mobile users

---

## Recommended Solution: Same Domain (Solution 1)

**Why:**
- ✅ No code changes required (just DNS)
- ✅ Maintains security (HttpOnly cookies)
- ✅ Works on all browsers
- ✅ 15 minutes to implement
- ✅ Industry best practice

**Steps to Implement:**

### 1. Add DNS CNAME Record

In your DNS provider (Namecheap, GoDaddy, Cloudflare, etc.):
```
Type: CNAME
Name: api
Value: promptlingo-backend.onrender.com
TTL: Auto
```

### 2. Configure Render Custom Domain

1. Log into Render dashboard
2. Go to your backend service
3. Settings → Custom Domains
4. Click "Add Custom Domain"
5. Enter: `api.promptlingo.ai`
6. Wait 5-10 minutes for SSL certificate

### 3. Update Frontend Environment Variable

In Netlify dashboard:
1. Site settings → Environment variables
2. Edit `REACT_APP_API_URL`
3. Change to: `https://api.promptlingo.ai`
4. Trigger new deployment

### 4. Test on Mobile

1. Open https://www.promptlingo.ai on mobile
2. Log in
3. Session should persist ✅

---

## Testing Checklist

After implementing fix, test on:

- [ ] ✅ iPhone Safari
- [ ] ✅ iPhone Chrome
- [ ] ✅ Android Chrome
- [ ] ✅ Android Firefox
- [ ] ✅ Desktop Safari
- [ ] ✅ Desktop Chrome
- [ ] ⚠️ Instagram in-app browser (may still fail - this is expected)
- [ ] ⚠️ Facebook in-app browser (may still fail - this is expected)

---

## FAQ

**Q: Why does it work on desktop but not mobile?**
A: Desktop browsers are more permissive with cross-origin cookies. Mobile browsers (especially Safari) are extremely strict due to privacy concerns.

**Q: I set `sameSite: 'none'` and `secure: true`, why doesn't it work?**
A: Safari's Intelligent Tracking Prevention (ITP) ignores these settings if it considers your backend a "third-party tracker." Using a subdomain (`api.promptlingo.ai`) makes Safari treat it as "first-party."

**Q: Can I keep using `promptlingo-backend.onrender.com`?**
A: Technically yes, but you'll lose 30-50% of mobile users who use Safari. Custom domain is strongly recommended.

**Q: What about in-app browsers (Instagram, Facebook)?**
A: In-app browsers block ALL third-party cookies, period. No workaround exists. Users must "Open in Safari" or "Open in Chrome" from the menu.

**Q: Should I switch to localStorage?**
A: Only as a last resort. HttpOnly cookies are more secure. Try the custom domain approach first.

**Q: Will this work for Netlify Functions or Edge Functions?**
A: Yes! If you move API logic to Netlify Functions, they'll be on the same domain automatically (`https://www.promptlingo.ai/.netlify/functions/...`). This is another option if you don't want to use Render.

---

## Alternative: Netlify Functions (All-in-One)

If you want to avoid custom domains entirely, deploy backend as Netlify Functions:

**Pros:**
- ✅ Same domain (www.promptlingo.ai)
- ✅ No custom domain setup needed
- ✅ Cookies work automatically
- ✅ Simplified deployment

**Cons:**
- ❌ Requires refactoring Express.js to serverless functions
- ❌ Cold start delays (first request slow)
- ❌ Limited to 10-second execution time
- ❌ More expensive at scale

**When to Use:**
- You're starting from scratch
- Low traffic (<1000 users)
- Want simplicity over performance

---

## Summary

| Solution | Effort | Security | Success Rate | Recommended |
|----------|--------|----------|--------------|-------------|
| **Same Domain (Subdomain)** | Low (15 min) | ✅ High | 95% | ✅ YES |
| **localStorage** | Medium (2-3 hrs) | ⚠️ Medium | 100% | ⚠️ If needed |
| **Hybrid** | Medium (3-4 hrs) | ✅/⚠️ Mixed | 100% | ⚠️ Complex |
| **Netlify Functions** | High (1-2 days) | ✅ High | 100% | ⚠️ Long-term |

**Recommendation:** Use **Same Domain** (Solution 1). It's the fastest, most secure, and industry-standard approach.

---

**Last Updated:** January 13, 2026
**Status:** In Progress (awaiting custom domain setup)
