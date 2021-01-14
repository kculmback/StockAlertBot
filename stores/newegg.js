import convertPriceToNumber from '../utils/convertPriceToNumber.js';
import DomParser from 'dom-parser'; // https://www.npmjs.com/package/dom-parser
import storeFunctionWrapper from '../utils/storeFunctionWrapper.js';

const store = 'Newegg';

export default async function newegg(url, interval, priceRequirement) {
  storeFunctionWrapper(store, url, interval, (data) => {
    const parser = new DomParser();
    const doc = parser.parseFromString(data, 'text/html');
    let title, inventory, image, price;
    let meetsPriceRequirement = true;

    // Check combo product
    if (url.includes('ComboDealDetails')) {
      title = doc.getElementsByTagName('title')[0].textContent;
      inventory = doc.getElementsByClassName('atnPrimary');
      image = 'https:' + doc.getElementById('mainSlide_0').getAttribute('src');
    } else {
      // Check normal product
      title = doc
        .getElementsByClassName('product-title')[0]
        .innerHTML.trim()
        .slice(0, 150);
      inventory = doc.getElementsByClassName('btn btn-primary btn-wide');
      image = doc.getElementsByClassName('image_url');
      if (image.length > 0) image = image[0].textContent;

      const productPrice = doc
        .getElementsByClassName('product-buy-box')[0]
        .getElementsByClassName('product-price')[0]
        .getElementsByClassName('price-current')[0].textContent;
      price = convertPriceToNumber(productPrice);
    }

    if (inventory.length > 0) {
      inventory = inventory[0].firstChild.textContent;
      inventory = inventory.toLowerCase();
    }

    if (priceRequirement !== null && price > priceRequirement) {
      meetsPriceRequirement = false;
    }

    const isInStock =
      inventory && inventory == 'add to cart ' && meetsPriceRequirement;

    return {
      isInStock,
      title,
      image,
      price,
    };
  });
}
