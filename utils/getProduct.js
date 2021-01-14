import { USER_AGENTS } from '../main.js';
import axios from 'axios';
import logError from '../utils/logError.js';
import moment from 'moment';

export default async function getProduct(store, url) {
  const options = {};

  const passUserAgent = store !== 'Best Buy';

  if (passUserAgent) {
    const userAgent =
      USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    options.headers = { 'User-Agent': userAgent };
  }

  try {
    const response = await axios.get(url, options);

    return response;
  } catch (error) {
    if (error.response && error.response.status == 503) {
      console.error(
        moment().format('LTS') +
          ': ' +
          store +
          ' 503 (service unavailable) Error. Interval possibly too low. Consider increasing interval rate.'
      );
      return;
    }

    logError(store, error);
  }
}
