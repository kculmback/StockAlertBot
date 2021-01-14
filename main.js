import config from './utils/config.js';

import { fileURLToPath } from 'url';

import BestBuyProduct from './stores/BestBuyProduct.js';
import NeweggProduct from './stores/NeweggProduct.js';
import BestBuyStore from './stores/BestBuyStore.js';
import AmazonProduct from './stores/AmazonProduct.js';

const { URLS } = config;

// Runs main only if this file is executed
if (process.argv[1] === fileURLToPath(import.meta.url)) main();

// https://www.XXX.com/... -> XXX
function getDomainName(url) {
  const hostName = new URL(url).hostname;
  const host = hostName.split('.');
  return host[1];
}

function main() {
  const bestBuyProducts = [];

  URLS.forEach((url) => {
    let storeName;
    let price = null;

    if (Array.isArray(url)) {
      price = url[1];
      url = url[0];
    }

    try {
      storeName = getDomainName(url);
    } catch (e) {
      console.error('Incorrect URL format:', url);
      console.error(e);
    }

    switch (storeName) {
      case 'antonline':
        // checkStore(antonline, url, price);
        break;

      case 'amazon':
        // amazonItems.push(new amazonItem(url, price));
        new AmazonProduct(url, price);
        break;

      case 'argos':
        // checkStore(argos, url, price);
        break;

      case 'bestbuy':
        // checkStore(bestbuy, url, price);
        bestBuyProducts.push(new BestBuyProduct(url, price));
        break;

      case 'costco':
        // checkStore(costco, url, price);
        break;

      case 'currys':
        // checkStore(currys, url, price);
        break;

      case 'microcenter':
        // checkStore(microcenter, url, price);
        break;

      case 'newegg':
        // checkStore(newegg, url, price);
        new NeweggProduct(url, price);
        break;

      case 'target':
        // checkStore(target, url, price);
        break;

      case 'tesco':
      case 'tescopreorders':
        // checkStore(tesco, url, price);
        break;

      default:
        console.error('This store is not supported:', storeName);
    }
  });

  new BestBuyStore(bestBuyProducts);
}
