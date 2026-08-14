const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: 'C:\\Users\\rajus\\.cache\\puppeteer\\chrome\\win64-150.0.7871.24\\chrome-win64\\chrome.exe' 
  });
  const page = await browser.newPage();
  
  // Enable console log capture
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  // Enable network request capture
  page.on('request', request => {
    if (request.url().includes('api')) {
      console.log(`REQ: ${request.method()} ${request.url()}`);
      console.log(`HEADERS:`, request.headers());
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('api')) {
      const status = response.status();
      console.log(`RES: ${status} ${response.url()}`);
      if (status >= 400) {
        try {
          console.log(`ERROR RESPONSE DATA:`, await response.text());
        } catch(e) {}
      }
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  
  console.log('Filling form...');
  await page.type('input[type="email"]', '24eg105a54@anurag.edu.in');
  await page.type('input[type="password"]', 'password123');
  
  console.log('Submitting login...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 10000 }).catch(() => console.log('Did not reach dashboard'))
  ]);
  
  console.log('Current URL after login:', page.url());
  const lsAfterLogin = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token in localStorage AFTER login:', lsAfterLogin);
  
  // Wait a bit to ensure everything is mounted
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking Discover...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const discover = links.find(l => l.textContent.includes('Discover'));
    if (discover) discover.click();
  });
  
  // Wait for the URL to change to either discover or login
  await page.waitForFunction(() => window.location.pathname !== '/dashboard', { timeout: 10000 }).catch(() => console.log('URL did not change from dashboard'));
  
  console.log('Current URL after clicking Discover:', page.url());
  const lsAfterDiscover = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token in localStorage AFTER Discover:', lsAfterDiscover);
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
