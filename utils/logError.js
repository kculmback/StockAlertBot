import writeErrorToFile from './writeErrorToFile.js';
import sendErrorToWebhooks from './sendErrorToWebhooks.js';
import { ERROR_WEBHOOK_URLS } from '../main.js';

export default async function logError(name, error) {
  writeErrorToFile(name, error);

  if (ERROR_WEBHOOK_URLS && ERROR_WEBHOOK_URLS.length) {
    sendErrorToWebhooks(name, error);
  }
}
