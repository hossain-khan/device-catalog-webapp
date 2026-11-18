import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server did not become ready at ${url} within ${timeoutMs}ms`);
}

async function run() {
  const preview = spawn('node', ['./node_modules/vite/bin/vite.js', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });

  let previewStderr = '';
  preview.stderr.on('data', (chunk) => {
    previewStderr += chunk.toString();
  });

  let browser;
  const pageErrors = [];
  try {
    await waitForServer(PREVIEW_URL);

    browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root > :not(script)', { timeout: 10000 });
    // Allow initial effects to settle
    await page.waitForTimeout(1000);

    if (pageErrors.length > 0) {
      const messages = pageErrors.map((e) => e.stack || e.message).join('\n---\n');
      throw new Error(`Uncaught page errors detected in production bundle:\n${messages}`);
    }

    console.log('✅ Production bundle smoke test passed (app mounted with 0 uncaught page errors).');
  } catch (err) {
    if (pageErrors.length > 0) {
      const messages = pageErrors.map((e) => e.stack || e.message).join('\n---\n');
      console.error('Uncaught page errors:\n', messages);
    }
    if (previewStderr) {
      console.error('vite preview stderr:\n', previewStderr);
    }
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
    preview.kill('SIGKILL');
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Smoke test failed:', err);
    process.exit(1);
  });
