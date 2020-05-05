import { promises as fs } from 'fs';
import * as http from 'http';
import { Server } from 'http';
import * as path from 'path';

import chalk from 'chalk';
import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import yargs from 'yargs';

// Define logging symbols
const arrowSymbol: string = process.platform === 'win32' ? '→' : '➜';

// Run
(async () => {
  // Extract CLI parameters
  const cliParameters = yargs
    .option('headless', {
      type: 'boolean',
      default: true,
    })
    .strict(true).argv;
  const serverPort: number = 9000;

  // Logging
  console.log(chalk.white.bold.underline('JavaScript Video Processing Performance Analysis'));
  console.log('');
  const startTime = new Date().getTime();

  // Prepare
  await fs.rmdir('results', {
    recursive: true,
  });
  await fs.mkdir('results');

  // Start server
  console.log(`${arrowSymbol} Start server`);
  const server: Server = http.createServer(async (request, response) => {
    const data: Buffer = await fs.readFile(path.join(__dirname, (request.url || '').split('?')[0]));
    response.writeHead(200);
    response.end(data);
  });
  await new Promise((resolve: () => void): void => {
    server.listen(serverPort, (): void => {
      resolve();
    });
  });

  // Start browser
  console.log(`${arrowSymbol} Start browser`);
  const browser: Browser = await puppeteer.launch({ headless: cliParameters.headless });
  const page: Page = await browser.newPage();
  await page.goto(`http://localhost:${serverPort}/index.html`);

  // Wait for and retrieve results
  console.log(`${arrowSymbol} Run performance analysis`);
  await page.tracing.start({ path: 'results/tracing-profile.json' });
  const results: string = await new Promise((resolve: (value: string) => void): void => {
    page.on('console', async (event) => {
      const value: string = (await event.args()[0].jsonValue()) as string;
      resolve(value);
    });
  });
  await page.tracing.stop();

  // Write results to file
  console.log(`${arrowSymbol} Save performance analysis results to disk`);
  await fs.writeFile('results/profiler-logs.json', results);

  // Close browser
  console.log(`${arrowSymbol} Close browser`);
  await browser.close();

  // Close server
  console.log(`${arrowSymbol} Close server`);
  await new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });

  // Logging
  const endTime = new Date().getTime();
  const processTime = ((endTime - startTime) / 1000).toFixed(2);
  console.log('');
  console.log(chalk.green.bold(`Done! [${processTime} seconds]`));
})();
