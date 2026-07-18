const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // 1. Go to Login
  await page.goto('http://localhost:5173/login');
  
  // 2. Fill login form
  await page.type('input[name="email"]', 'testuser1@example.com');
  await page.type('input[name="password"]', 'Password123!');
  
  // Intercept backend requests
  page.on('response', async (response) => {
    if (response.url().includes('/api/auth/login')) {
      console.log('Login Response Status:', response.status());
    }
    if (response.url().includes('/api/profile') || response.url().includes('/api/notifications')) {
      console.log('API Request to:', response.url(), 'Status:', response.status());
    }
  });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  console.log("Current URL after login:", page.url());
  
  // 4. Check token in localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token in localStorage:", !!token);
  
  // 5. Click Discover
  await Promise.all([
    page.goto('http://localhost:5173/discover'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
  ]);
  
  console.log("Current URL after navigating to Discover:", page.url());
  const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token after Discover:", !!tokenAfter);
  
  await browser.close();
})();
