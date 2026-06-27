const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173/admin/qr-certificates', { waitUntil: 'networkidle2' });
  
  // Wait a little bit to see if any rendering crashes happen
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
