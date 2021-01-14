import logNotInStock from '../utils/logNotInStock.js';
import Product from './Product.js';

export default class BestBuyProduct extends Product {
  constructor(url, priceRequirement) {
    const STORE = 'BestBuy';

    super({
      store: STORE,
      url,
      priceRequirement,
    });
  }

  get sku() {
    const url = new URL(this.url);
    return url.searchParams.get('skuId');
  }

  async checkStore(bestBuyProduct) {
    const { isInStock, title, image, price, url } = this.checkInventory(
      bestBuyProduct
    );

    if (!isInStock && this.firstRun) {
      logNotInStock(title, this.store, `second`);
    } else if (isInStock) {
      this.handleNotification({ title, image, price, url });
    }

    this.firstRun = false;
  }

  checkInventory(bestBuyProduct) {
    const price = bestBuyProduct.salePrice || bestBuyProduct.regularPrice;
    const isInStock =
      bestBuyProduct.onlineAvailability &&
      (this.priceRequirement === null || price < this.priceRequirement);

    return {
      isInStock,
      title: bestBuyProduct.name,
      image: bestBuyProduct.thumbnailImage || bestBuyProduct.image,
      url: bestBuyProduct.addToCartUrl || bestBuyProduct.url,
      price,
    };
  }
}
