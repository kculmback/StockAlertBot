import fs from 'fs';
import { config as env } from 'dotenv';

env();

function config() {
  return JSON.parse(
    fs.readFileSync(new URL('../config.json', import.meta.url), 'utf-8')
  );
}

export default config();
