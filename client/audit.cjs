const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('response', async (response) => {
    if (response.status() === 401) {
      console.log('401 UNAUTHORIZED:', response.url());
    }
  });

  console.log("Navigating to register...");
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    document.querySelector('input[name="name"]').value = 'Audit User';
    document.querySelector('input[name="email"]').value = `audit${Date.now()}@example.com`;
    document.querySelector('input[name="password"]').value = 'Password123!';
  });
  
  await page.click('button[type="submit"]');
  console.log("Clicked register, waiting 3s...");
  await new Promise(r => setTimeout(r, 3000));
  
  // Registration goes to login. We need to login now.
  console.log("URL after register:", page.url());
  const currentEmail = await page.evaluate(() => document.querySelector('input[name="email"]')?.value || '');
  if (!currentEmail) {
      await page.evaluate(() => {
          document.querySelector('input[name="email"]').value = `audit${Date.now()}@example.com`; // might fail if timestamp diff, but let's just create a new login flow
      });
  }

  // Let's just create an account directly in DB or we use existing register?
  // Let's just type directly
  const email = `audit${Date.now()}@example.com`;
  console.log("Registering with", email);
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
  await page.type('input[name="name"]', 'Audit User');
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 3000));

  console.log("Logging in with", email);
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 3000));
  
  let token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token after login:", token ? "Exists" : "Null");
  console.log("URL after login:", page.url());

  console.log("Navigating to /discover directly...");
  await page.goto('http://localhost:5173/discover', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token after /discover:", token ? "Exists" : "Null");
  console.log("URL after /discover:", page.url());

  console.log("Navigating to /notifications directly...");
  await page.goto('http://localhost:5173/notifications', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token after /notifications:", token ? "Exists" : "Null");
  console.log("URL after /notifications:", page.url());

  await browser.close();
})();
