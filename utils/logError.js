import writeErrorToFile from './writeErrorToFile.js';
import sendErrorToWebhooks from './sendErrorToWebhooks.js';
import config from './config.js';

const { ERROR_WEBHOOK_URLS } = config;

export default async function logError(name, error) {
  console.error(name, error);

  writeErrorToFile(name, error);

  if (ERROR_WEBHOOK_URLS && ERROR_WEBHOOK_URLS.length) {
    sendErrorToWebhooks(name, error);
  }
}
