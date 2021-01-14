import config from '../utils/config.js';
import convertPriceToNumber from '../utils/convertPriceToNumber.js';
import Interval from '../utils/Interval.js';
import Product from './Product.js';

const { INTERVAL } = config;

export default class AmazonProduct extends Product {
  constructor(url, priceRequirement) {
    const STORE = 'Amazon';

    super({
      store: STORE,
      url,
      priceRequirement,
      interval: new Interval({
        unit: INTERVAL.unit,
        min: INTERVAL.min,
        max: INTERVAL.max + 5,
      }),
    });

    this.initiate();
  }

  async checkInventory(data) {
    const doc = this.getDoc(data);

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

    if (this.priceRequirement !== null && price > this.priceRequirement) {
      meetsPriceRequirement = false;
    }

    if (inventory != null) inventory = inventory.getAttribute('value');

    const isInStock = inventory === 'Add to Cart' && meetsPriceRequirement;

    return {
      isInStock,
      title,
      image,
      price,
    };
  }
}
