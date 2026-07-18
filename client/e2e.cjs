const puppeteer = require('puppeteer');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.navbar');
  const navbarVisible = await page.evaluate(() => {
    const nav = document.querySelector('.navbar-collapse');
    return window.getComputedStyle(nav).visibility;
  });
  console.log('Navbar visibility:', navbarVisible);
  await page.screenshot({ path: 'navbar_home.png' });

  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', 'test_jwt_fix3@example.com');
  await page.type('input[name="password"]', 'Password123');
  await page.click('button[type="submit"]');
  
  await wait(2000);
  console.log('Current URL after login:', page.url());
  await page.screenshot({ path: 'login_success.png' });

  await page.goto('http://localhost:5173/discover');
  await wait(2000);
  console.log('Current URL at Discover:', page.url());
  await page.screenshot({ path: 'discover_page.png' });
  
  await page.goto('http://localhost:5173/notifications');
  await wait(2000);
  console.log('Current URL at Notifications:', page.url());
  await page.screenshot({ path: 'notifications_page.png' });

  await browser.close();
})();
