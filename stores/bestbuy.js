import DomParser from 'dom-parser'; // https://www.npmjs.com/package/dom-parser
import convertPriceToNumber from '../utils/convertPriceToNumber.js';
import storeFunctionWrapper from '../utils/storeFunctionWrapper.js';

const store = 'Best Buy';

export default async function bestbuy(url, interval, priceRequirement) {
  await storeFunctionWrapper(store, url, interval, (data) => {
    const parser = new DomParser();
    const doc = parser.parseFromString(data, 'text/html');

    const title = doc
      .getElementsByClassName('sku-title')[0]
      .childNodes[0].textContent.trim()
      .slice(0, 150);
    const image = doc
      .getElementsByTagName('meta')
      .filter((meta) => meta.getAttribute('property') == 'og:image')[0]
      .getAttribute('content');
    const openBox = doc.getElementsByClassName('open-box-option__label');
    let inventory = doc.getElementsByClassName('add-to-cart-button');

    if (inventory.length > 0) inventory = inventory[0].textContent;

    const hasOpenBox = openBox && openBox.length > 0;
    const openBoxPrice = hasOpenBox
      ? convertPriceToNumber(
          doc.getElementsByClassName('open-box-option__link')[0].textContent
        )
      : null;
    const openBoxInStockAndMeetsPriceRequirements =
      hasOpenBox &&
      (priceRequirement === null || openBoxPrice <= priceRequirement);

    const hasInventory = inventory === 'Add to Cart';
    const regularPrice = hasInventory
      ? convertPriceToNumber(
          doc
            .getElementsByClassName('price-box')[0]
            .getElementsByClassName('priceView-hero-price')[0]
            .getElementsByTagName('span')[0].textContent
        )
      : null;
    const regularInStockAndMeetsPriceRequirements =
      hasInventory &&
      (priceRequirement === null || regularPrice <= priceRequirement);
    const isInStock =
      regularInStockAndMeetsPriceRequirements ||
      openBoxInStockAndMeetsPriceRequirements;

    return {
      isInStock,
      title,
      image,
      price: regularInStockAndMeetsPriceRequirements
        ? regularPrice
        : openBoxPrice,
      stockType: regularInStockAndMeetsPriceRequirements
        ? 'In Stock'
        : 'Open Box',
    };
  });
}
