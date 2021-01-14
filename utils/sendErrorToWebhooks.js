import axios from 'axios';
import moment from 'moment';
import util from 'util';
import { ERROR_WEBHOOK_URLS } from '../main.js';

export default async function sendErrorToWebhooks(name, error) {
  const title = `Error for: ${name}`;
  const content = util.inspect(error).slice(0, 2000);
  const thumbnail = 'https://s2.svgbox.net/materialui.svg?ic=error_outline';
  const footerText = `${name} Error Bot | ${moment().format(
    'MMMM Do YYYY - h:mm:ss A'
  )}`;

  ERROR_WEBHOOK_URLS.forEach(
    // For each Webhook URL...
    (url) => {
      // Notify Discord
      if (url.includes('discord')) {
        console.info(moment().format('LTS') + ': Sending ERROR to discord.');
        axios({
          method: 'POST',
          url: url,
          headers: {
            'Content-type': 'application/json',
          },
          data: {
            username: name,
            content: content,
            embeds: [
              {
                title: title,
                color: '15736093',
                footer: {
                  text: footerText,
                },
                thumbnail: {
                  url: thumbnail,
                },
              },
            ],
          },
        }).catch((error) => console.error(error));

        // Notify Slack
      } else if (url.includes('slack')) {
        console.info(moment().format('LTS') + ': Sending alert to slack.');
        axios
          .post(url, {
            attachments: [
              {
                title: title,
                text: content,
                color: '#f01d1d',
                thumb_url: thumbnail,
                footer: footerText,
              },
            ],
          })
          .catch((error) => console.error(error));
      }
    }
  );
}
