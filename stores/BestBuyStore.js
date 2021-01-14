import bestbuy from 'bestbuy';
import logError from '../utils/logError.js';
import wait from '../utils/wait.js';

const bby = bestbuy({
  key: process.env.BEST_BUY_KEY,
  requestsPerSecond: 1,
  maxRetries: 4,
  retryInterval: 2000,
  timeout: 15000,
});

const store = 'BestBuy';

export default class BestBuyStore {
  constructor(products = []) {
    this.products = products;

    this.initiate();
  }

  get skus() {
    return this.products.map((product) => product.sku).join(',');
  }

  async initiate() {
    try {
      await this.checkStore();
    } catch (error) {
      console.error(`Uncaught error for: BestBuy`);
      logError(store, error);
    }

    this.firstRun = false;

    await wait(1000 * 3);

    this.initiate();
  }

  async checkStore() {
    try {
      const { total, products } = await bby.products(
        `(sku in (${this.skus}))`,
        {
          show:
            'image,onlineAvailability,regularPrice,salePrice,name,addToCartUrl,thumbnailImage,url,sku',
          pageSize: 20,
        }
      );

      if (total === 0) {
        logError(store, new Error('No products found'));
        return;
      }

      this.products.forEach((product) => {
        const bestBuyMatch = products.find(
          (bestBuyProduct) => `${bestBuyProduct.sku}` === product.sku
        );

        if (!bestBuyMatch) {
          console.error(`No Best Buy match for ${product.sku}`);
          return;
        }

        product.checkStore(bestBuyMatch);
      });
    } catch (error) {
      logError(store, error);
    }
  }
}
