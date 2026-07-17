import { readFileSync } from 'node:fs';
import puppeteer from 'puppeteer';
import { expect } from 'chai';
import { WebSocketServer } from 'ws';

const sampleDot = readFileSync(new URL('./fixtures/sample.dot', import.meta.url), 'utf8');
const NODE_COUNT = 11;

const countNodes = (page) =>
  page.$$eval('.policy-topology-container svg g.node', (nodes) => nodes.length);

describe('PolicyTopology Page', function () {
  let wss;
  let browser;
  let page;

  before(async function () {
    // mock the websocket feed the app subscribes to for DOT strings
    wss = new WebSocketServer({ port: 4000, path: '/ws' });
    wss.on('connection', (socket) => {
      socket.send(sampleDot);
    });

    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:3000');
  });

  after(async function () {
    if (browser) await browser.close();
    if (wss) await new Promise((resolve) => wss.close(resolve));
  });

  it('renders the topology graph from the websocket feed', async function () {
    await page.waitForSelector('.policy-topology-container svg g.node');
    const count = await countNodes(page);
    expect(count).to.equal(NODE_COUNT);
  });

  it('filters the graph when a node is clicked', async function () {
    // node click handlers attach after the 750ms render transition, so retry
    let count = NODE_COUNT;
    for (let attempt = 0; attempt < 5 && count === NODE_COUNT; attempt++) {
      await page.click('.policy-topology-container svg g.node');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      count = await countNodes(page);
    }
    expect(count).to.be.greaterThan(0);
    expect(count).to.be.lessThan(NODE_COUNT);
  });

  it('restores the full graph on reset', async function () {
    const resetButton = await page.waitForSelector('button ::-p-text(Reset Graph)');
    await resetButton.click();
    await page.waitForFunction(
      (expected) =>
        document.querySelectorAll('.policy-topology-container svg g.node').length === expected,
      { timeout: 10000 },
      NODE_COUNT
    );
  });
});
