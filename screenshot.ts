import { Cluster } from 'puppeteer-cluster3';
import { Page, BoundingBox } from 'puppeteer';

async function screenshot(
  cluster: Cluster,
  options: {
    url: string;
    clip?: BoundingBox | undefined;
    waitXpath?: string | undefined;
    headers?: Record<string, string> | undefined;
  }
): Promise<void> {
  const { url, clip, waitXpath, headers } = options;

  const task = async ({ page }: { page: Page }) => {
    try {
      if (headers) {
        await page.setExtraHTTPHeaders(headers);
      }

      const waitUntil = !waitXpath ? 'domcontentloaded' : 'load';
      await page.goto(url, { waitUntil: waitUntil });

      if (waitXpath) {
        await page.waitForXPath(waitXpath);
      }

      await page.screenshot({
        encoding: 'binary',
        type: 'png',
        fullPage: !clip,
        clip: clip,
      });
    } finally {
      // await page.close();
    }
  };

  const startTime = Date.now();

  await cluster.execute(task);

  console.log(`Total elapsed time: ${ Date.now() - startTime } ms`);
}

const promise = Cluster.launch({
  concurrency: Cluster.CONCURRENCY_CONTEXT,
  maxConcurrency: 2,
  puppeteerOptions: {
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

promise.then((cluster) => {
  const url = 'http://192.168.1.217:2085/#/window/378407ec-b1c3-42bf-b0a5-5a098134d443-04010000';
  const clip: BoundingBox = { width: 500, height: 320, y: 0, x: 0 };
  const xpath = '//de-analysis-chart[@data-render-status="rendered"] | //span[text()="当前图表在查询条件下无数据"]';
  const headers = { ['IS_REPORT_WINDOW']: 'true' };

  for (let count = 0; count < 5; count++) {
    screenshot(cluster, {
      url: url,
      clip: clip,
      waitXpath: xpath,
      headers: headers,
    }).then();
  }
});
