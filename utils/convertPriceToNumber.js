export default function convertPriceToNumber(price) {
  return Number(price.replace(/[^0-9.-]+/g, ''));
}
