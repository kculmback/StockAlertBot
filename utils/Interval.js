import config from './config.js';

const { INTERVAL } = config;

export default class Interval {
  constructor({ unit, min, max } = INTERVAL) {
    this.unit = unit;
    this.min = min;
    this.max = max;
  }

  get randomInterval() {
    const min = Math.ceil(this.min);
    const max = Math.floor(this.max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  get timeout() {
    let timeout = this.randomInterval * 1000;

    switch (this.unit) {
      case 'minutes':
        timeout = timeout * 60;
        break;
      case 'hours':
        timeout = timeout * 60 * 60;
        break;
    }

    return timeout;
  }
}
