import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('PolicyTopology Page', function () {
  let browser;
  let page;

  before(async function () {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  after(async function () {
    await browser.close();
  });

  it('should render and interact with dropdown', async function () {
    const dropdownButton = await page.waitForSelector('#pf-dropdown-toggle-id-2');
    await dropdownButton.click();
    console.log('Dropdown found, attempting to click');

    const gatewayItem = await page.waitForSelector('text=Gateway');
    const listenerItem = await page.waitForSelector('text=Listener');

    expect(gatewayItem).to.not.be.null;
    expect(listenerItem).to.not.be.null;
    console.log('Gateway and Listener items found');

    await gatewayItem.click();
    console.log('Clicked on Gateway item');
  });
});
