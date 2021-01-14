import axios from 'axios';
import config from '../utils/config.js';
import DomParser from 'dom-parser';
import Interval from '../utils/Interval.js';
import logError from '../utils/logError.js';
import logNotInStock from '../utils/logNotInStock.js';
import moment from 'moment';
import open from 'open';
import sendAlertToWebhooks from '../utils/webhook.js';
import threeBeeps from '../utils/beep.js';
import wait from '../utils/wait.js';

const { ALARM, OPEN_URL, USER_AGENTS, REFERERS } = config;

export default class Product {
  constructor({ store, url, priceRequirement, interval = new Interval() }) {
    this.store = store;
    this.url = url;
    this.interval = interval;
    this.priceRequirement = priceRequirement;
    this.firstRun = true;
    this.urlOpened = false;
    this.retriesLeft = 10;
  }

  async initiate() {
    if (this.maxRetriesExceeded) {
      this.notifyMaxRetries();
      return;
    }
    await wait(this.interval.timeout);

    try {
      await this.checkStore();
    } catch (error) {
      console.error(`Uncaught error for: ${this.store} @ ${this.url}`);
      logError(this.store, error);
    }

    this.firstRun = false;

    this.initiate();
  }

  async checkStore() {
    const response = await this.getProduct();

    if (!response || response.status !== 200) {
      this.handleNonOkayResponse();
      return;
    }

    const {
      isInStock,
      title,
      image,
      price,
      stockType = 'In Stock',
    } = await this.checkInventory(response.data);

    if (!isInStock && this.firstRun) {
      this.logNotInStock(title);
    } else if (isInStock) {
      this.handleNotification({ title, image, price, stockType });
    }
  }

  async getProduct() {
    const options = {
      referrer: this.referer,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      Pragma: 'no-cache',
      headers: this.apiHeaders,
    };

    try {
      const response = await axios.get(this.url, options);

      return response;
    } catch (error) {
      if (error.response && [503, 429].includes(error.response.status)) {
        const errorStatusText =
          error.response.status === 429
            ? '429 (too many requests)'
            : '503 (service unavailable)';

        this.retriesLeft -= 1;
        this.interval.max += 2;
        this.firstRun = true;

        console.error(
          moment().format('LTS') +
            ': ' +
            this.store +
            ` ${errorStatusText} Error. Interval possibly too low. Consider increasing interval rate.`
        );
        return;
      }

      logError(this.store, error);
    }
  }

  async checkInventory() {
    console.warn(`checkInventory is not overridden for ${this.store}!`);
    return {};
  }

  getDoc(data) {
    const parser = new DomParser();
    return parser.parseFromString(data, 'text/html');
  }

  handleNonOkayResponse() {
    const time = moment().format('LTS');
    console.info(
      `${time}: Error occured checking ${this.store}.`,
      `Retrying in ${this.interval.min}-${this.interval.max} ${this.interval.unit}.`
    );
  }

  logNotInStock(title) {
    logNotInStock(
      title,
      this.store,
      `${this.interval.min}-${this.interval.max} ${this.interval.unit}`
    );
  }

  handleNotification({
    title,
    image,
    price,
    stockType = 'In Stock',
    url,
  } = {}) {
    if (ALARM) threeBeeps();
    if (OPEN_URL && !this.urlOpened) {
      open(url || this.url);
      sendAlertToWebhooks(url || this.url, title, image, this.store, price);

      // Open URL and post to webhook every minute
      this.urlOpened = true;
      setTimeout(() => {
        this.urlOpened = false;
      }, 1000 * 60 * 4 - 5);
    }

    console.info(
      `${this.now}: ***** ${stockType} at ${this.store} *****: `,
      title
    );
    console.info(this.url);
  }

  notifyMaxRetries() {
    logError(
      this.store,
      new Error(
        `Too many 503 or 429 errors. Restart app to start trying again. ${this.url}`
      )
    );
  }

  get apiHeaders() {
    const userAgent =
      USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    return { 'User-Agent': userAgent };
  }

  get referer() {
    return REFERERS[Math.floor(Math.random() * REFERERS.length)];
  }

  get now() {
    return moment().format('LTS');
  }

  get maxRetriesExceeded() {
    return this.retriesLeft <= 0;
  }
}
