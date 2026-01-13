const express = require('express');
const router = express.Router();

/**
 * Debug endpoint to check cookie and authentication status
 * Useful for debugging mobile browser cookie issues
 */
router.get('/session', (req, res) => {
  const headers = req.headers;
  const cookies = req.cookies;
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('🔍 [DEBUG] Session check request:');
  console.log('   - Origin:', headers.origin);
  console.log('   - User-Agent:', headers['user-agent']);
  console.log('   - Cookies received:', Object.keys(cookies));
  console.log('   - Has accessToken:', !!cookies.accessToken);
  console.log('   - Has refreshToken:', !!cookies.refreshToken);
  console.log('   - Environment:', isProduction ? 'production' : 'development');

  // Detect mobile browser
  const userAgent = headers['user-agent'] || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent);
  const isInAppBrowser = /FBAN|FBAV|Instagram|Twitter|LinkedIn/i.test(userAgent);

  res.json({
    success: true,
    data: {
      hasCookies: Object.keys(cookies).length > 0,
      hasAccessToken: !!cookies.accessToken,
      hasRefreshToken: !!cookies.refreshToken,
      cookieNames: Object.keys(cookies),
      origin: headers.origin,
      userAgent: userAgent,
      deviceInfo: {
        isMobile,
        isSafari,
        isChrome,
        isInAppBrowser
      },
      environment: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * Test endpoint to set a test cookie and verify it works
 */
router.get('/test-cookie', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Set a test cookie with same settings as auth cookies
  res.cookie('test_cookie', 'test_value_' + Date.now(), {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 60 * 1000 // 1 minute
  });

  console.log('🍪 [DEBUG] Test cookie set');

  res.json({
    success: true,
    message: 'Test cookie set. Now call /api/debug/verify-cookie to check if it was received.',
    cookieSettings: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: '1 minute'
    }
  });
});

/**
 * Verify endpoint to check if test cookie was received
 */
router.get('/verify-cookie', (req, res) => {
  const testCookie = req.cookies.test_cookie;
  const hasTestCookie = !!testCookie;

  console.log('🔍 [DEBUG] Cookie verification:');
  console.log('   - Test cookie received:', hasTestCookie);
  console.log('   - Test cookie value:', testCookie);
  console.log('   - All cookies:', Object.keys(req.cookies));

  res.json({
    success: true,
    cookieWorking: hasTestCookie,
    testCookieValue: testCookie,
    allCookies: Object.keys(req.cookies),
    message: hasTestCookie
      ? '✅ Cookies are working correctly!'
      : '❌ Cookies NOT working - browser may be blocking them'
  });
});

module.exports = router;
