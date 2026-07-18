const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const logLS = async (step) => {
    const ls = await page.evaluate(() => JSON.stringify(localStorage));
    console.log(`[${step}] LocalStorage: ${ls}`);
  };

  // 0. Register first
  await page.goto('http://localhost:5173/register');
  await page.type('input[name="name"]', 'Test User');
  await page.type('input[name="email"]', 'testuser2@example.com');
  await page.type('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log("Register timeout"));

  // 1. Go to Login
  await page.goto('http://localhost:5173/login');
  await logLS('Before Login');
  
  // 2. Fill login form
  await page.type('input[name="email"]', 'testuser2@example.com');
  await page.type('input[name="password"]', 'Password123!');
  
  page.on('response', async (response) => {
    console.log(`Response: ${response.url()} [${response.status()}]`);
  });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log("Navigation timeout after login, maybe login failed"))
  ]);
  
  await logLS('After Login');
  
  // Let's also check if JWT is valid in backend by doing a fetch from page context
  const backendCheck = await page.evaluate(async () => {
    const token = localStorage.getItem('token');
    if (!token) return "No token to check";
    
    try {
      const res = await fetch('http://localhost:5000/api/profile?simple=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return `Profile Check Status: ${res.status}`;
    } catch(e) {
      return `Profile Check Error: ${e.message}`;
    }
  });
  console.log("Backend check result:", backendCheck);

  // 5. Click Discover
  await page.goto('http://localhost:5173/discover');
  // Wait a bit to see if we get redirected
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Current URL after navigating to Discover:", page.url());
  await logLS('After Discover Navigation');
  
  await browser.close();
})();
