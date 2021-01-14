import moment from 'moment';

export default function logNotInStock(title, store, retry) {
  const now = moment().format('LTS');
  console.info(
    `${now}: "${title}" not in stock at ${store}.`,
    `Will keep retrying in background every ${retry}.`
  );
}
