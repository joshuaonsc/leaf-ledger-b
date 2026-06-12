// CI accessibility gate for Leaf Ledger.
//
// Runs axe-core against the served page in headless Chromium and fails the
// build ONLY on violations. axe "incomplete" results (things axe cannot decide
// on its own, such as contrast through a CSS gradient or inside a <textarea>)
// are printed for transparency but do not fail the build: they require human
// review, and the contrast ratios have been verified by hand.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const url = process.argv[2];
if (!url) {
  console.error('usage: node check.mjs <url>');
  process.exit(2);
}

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1024 });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('#f_class option', { timeout: 10000 }); // app has initialised
  await page.addScriptTag({ content: axeSource });

  const results = await page.evaluate(() =>
    window.axe.run(document, { resultTypes: ['violations', 'incomplete'] })
  );

  const render = (items) =>
    items
      .map((r) =>
        [`  - [${r.id}] ${r.help}`]
          .concat(r.nodes.map((n) => `      ${n.target.join(' ')}`))
          .join('\n')
      )
      .join('\n');

  console.log(`axe-core ${results.testEngine.version} on ${url}`);
  console.log(
    `\nIncomplete (needs manual review, does not fail the build): ${results.incomplete.length}`
  );
  if (results.incomplete.length) console.log(render(results.incomplete));
  console.log(`\nViolations (fail the build): ${results.violations.length}`);
  if (results.violations.length) console.log(render(results.violations));

  await browser.close();
  process.exit(results.violations.length > 0 ? 1 : 0);
} catch (err) {
  console.error('axe check failed to run:', err?.message || err);
  await browser.close().catch(() => {});
  process.exit(2);
}
