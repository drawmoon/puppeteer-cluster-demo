import puppeteer from 'puppeteer';
import { Browser, BoundingBox } from 'puppeteer';

async function screenshot(
  browser: Browser,
  options: {
    url: string;
    clip?: BoundingBox | undefined;
    waitXpath?: string | undefined;
    headers?: Record<string, string> | undefined;
  }
): Promise<void> {
  const { url, clip, waitXpath, headers } = options;

  console.time('Total elapsed time');

  console.time('Elapsed time for new browser tab');

  const page = await browser.newPage();

  console.timeEnd('Elapsed time for new browser tab');

  try {
    console.time('Elapsed time to open the page');

    if (headers) {
      await page.setExtraHTTPHeaders(headers);
    }

    const waitUntil = !waitXpath ? 'domcontentloaded' : 'load';
    await page.goto(url, { waitUntil: waitUntil });

    console.timeEnd('Elapsed time to open the page');

    if (waitXpath) {
      console.time('Elapsed time to wait the xpath');

      await page.waitForXPath(waitXpath);

      console.timeEnd('Elapsed time to wait the xpath');
    }

    await page.screenshot({
      encoding: 'binary',
      type: 'png',
      fullPage: !clip,
      clip: clip,
    });
  } finally {
    await page.close();

    console.timeEnd('Total elapsed time');
  }
}

const promise = puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

promise.then(async (browser) => {
  const url = 'http://192.168.1.217:2085/#/window/378407ec-b1c3-42bf-b0a5-5a098134d443-04010000';
  const clip: BoundingBox = { width: 500, height: 320, y: 0, x: 0 };
  const xpath = '//de-analysis-chart[@data-render-status="rendered"] | //span[text()="当前图表在查询条件下无数据"]';
  const headers = { ['IS_REPORT_WINDOW']: 'true' };
      
  await screenshot(browser, {
    url: url,
    clip: clip,
    waitXpath: xpath,
    headers: headers,
  });
});
