import getProduct from './getProduct.js';
import { ALARM, OPEN_URL } from '../main.js';
import sendAlertToWebhooks from './webhook.js';
import threeBeeps from './beep.js';
import moment from 'moment';
import open from 'open';
import handleNonOkayResponse from './handleNonOkayResponse.js';
import logError from './logError.js';

const hasRun = new Map();

export default async function storeFunctionWrapper(
  store,
  url,
  interval,
  storeFunction
) {
  {
    try {
      const response = await getProduct(store, url);

      if (!response || response.status !== 200) {
        handleNonOkayResponse(store, interval);
        return;
      }

      const {
        isInStock,
        title,
        image,
        price,
        stockType = 'In Stock',
      } = await storeFunction(response.data);

      const firstRun = !hasRun.has(url);

      if (!isInStock && firstRun) {
        console.info(
          `${moment().format(
            'LTS'
          )}: "${title}" not in stock at ${store}. Will keep retrying in background every`,
          interval.value,
          interval.unit
        );
      } else if (isInStock) {
        if (ALARM) threeBeeps();
        if (OPEN_URL && !hasRun.get(url)) {
          open(url);
          sendAlertToWebhooks(url, title, image, store, price);

          // Open URL and post to webhook every minute
          setTimeout(() => {
            hasRun.set(url, false);
          }, 1000 * 55);
        }
        console.info(
          `${moment().format('LTS')}: ***** ${stockType} at ${store} *****: `,
          title
        );
        console.info(url);
      }

      hasRun.set(url, true);
    } catch (e) {
      logError(store, e);
    }
  }
}
