import { fileURLToPath } from 'url';
import { ALARM, OPEN_URL, USER_AGENTS } from '../main.js';
import threeBeeps from '../utils/beep.js';
import sendAlertToWebhooks from '../utils/webhook.js';
import logError from '../utils/logError.js';
import convertPriceToNumber from '../utils/convertPriceToNumber.js';
import axios from 'axios';
import moment from 'moment';
import DomParser from 'dom-parser'; // https://www.npmjs.com/package/dom-parser
import open from 'open';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let interval = {
    unit: 'seconds', // seconds, m: minutes, h: hours
    value: 25, // Amazon detects bots if too low, do > 10 seconds
  };
  let url =
    'https://www.amazon.com/Coredy-Super-Strong-Automatic-Self-Charging-Medium-Pile/dp/B07NPNN57S';
  amazon(url, interval, interval.value, true, false, () => null);
}

const store = 'Amazon';
export default async function amazon(
  url,
  interval,
  priceRequirement,
  originalIntervalValue,
  firstRun,
  urlOpened,
  resolve
) {
  try {
    const response = await axios
      .get(url, {
        headers: {
          'User-Agent':
            USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        },
      })
      .catch(async function (error) {
        if (error.response && error.response.status == 503)
          console.error(
            moment().format('LTS') +
              ': ' +
              store +
              ' 503 (service unavailable) Error. Changing interval rate for',
            url
          );
        else logError(store, error);
      });

    if (!response || response.status !== 200) {
      resolve({
        interval: Math.floor(
          interval.value + Math.random() * originalIntervalValue
        ),
        urlOpened: urlOpened,
      });
      return;
    }

    const parser = new DomParser();
    const doc = parser.parseFromString(response.data, 'text/html');
    let meetsPriceRequirement = true;

    const title = doc
      .getElementById('productTitle')
      .innerHTML.trim()
      .slice(0, 150);
    let inventory = doc.getElementById('add-to-cart-button');
    const image = doc
      .getElementById('landingImage')
      .getAttribute('data-old-hires');

    const priceEl = doc.getElementById('price_inside_buybox');
    let price;
    if (priceEl) price = convertPriceToNumber(priceEl.textContent);

    if (priceRequirement !== null && price > priceRequirement) {
      meetsPriceRequirement = false;
    }

    if (inventory != null) inventory = inventory.getAttribute('value');

    if (
      inventory &&
      inventory === 'Add to Cart' &&
      (price === undefined || price === null || isNaN(price))
    ) {
      logError(
        store,
        new Error(`Price error! In stock but price is: ${price}`)
      );
    }

    if ((inventory !== 'Add to Cart' || !meetsPriceRequirement) && firstRun) {
      console.info(
        moment().format('LTS') +
          ': "' +
          title +
          '" not in stock at ' +
          store +
          '.' +
          ' Will keep retrying in background every',
        interval.value,
        interval.unit
      );
    } else if (
      inventory !== null &&
      inventory === 'Add to Cart' &&
      meetsPriceRequirement
    ) {
      if (ALARM) threeBeeps();
      if (OPEN_URL && !urlOpened) {
        open(url);
        sendAlertToWebhooks(url, title, image, store, price);
        urlOpened = true;
      }
      console.info(
        moment().format('LTS') + ': ***** In Stock at ' + store + ' *****: ',
        title
      );
      console.info(url);
    }
    resolve({ interval: interval.value, urlOpened: urlOpened });
  } catch (e) {
    logError(store, e);
  }
}
