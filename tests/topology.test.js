import puppeteer from 'puppeteer';
import { expect } from 'chai';

describe('PolicyTopology Page', function () {
  let browser;
  let page;

  before(async function () {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:3000');
  });

  after(async function () {
    await browser.close();
  });

  it('should render and interact with dropdown', async function () {
    try {
      const dropdownButton = await page.waitForSelector('[data-ouia-component-type="PF4/DropdownToggle"]');
      await dropdownButton.click();

      await page.waitForSelector('.pf-c-dropdown__menu', { visible: true });

      const gatewayItem = await page.waitForSelector('text=Gateway');
      const listenerItem = await page.waitForSelector('text=Listener');

      expect(gatewayItem).to.not.be.null;
      expect(listenerItem).to.not.be.null;

      await gatewayItem.click();
    } catch (error) {
      const rootContent = await page.evaluate(() => document.querySelector('#root').innerHTML);
      console.error('Error encountered, dumping #root content:\n', rootContent);
      throw error;
    }
  });
});
