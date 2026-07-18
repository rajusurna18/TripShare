const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  const email = `audit${Date.now()}@example.com`;
  console.log("Registering with", email);
  await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
  await page.type('input[name="name"]', 'Audit User');
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 2000));

  console.log("Logging in...");
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 2000));
  console.log("URL after login:", page.url());

  console.log("Clicking Discover link in Navbar...");
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.nav-link'));
    const link = links.find(l => l.textContent.includes('Discover'));
    if (link) link.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  let token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token after clicking Discover:", token ? "Exists" : "Null");
  console.log("URL after clicking Discover:", page.url());

  console.log("Navigating back to dashboard...");
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });

  console.log("Clicking Notifications link in Navbar...");
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.nav-link'));
    const link = links.find(l => l.textContent.includes('🔔'));
    if (link) link.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  token = await page.evaluate(() => localStorage.getItem('token'));
  console.log("Token after clicking Notifications:", token ? "Exists" : "Null");
  console.log("URL after clicking Notifications:", page.url());

  await browser.close();
})();
