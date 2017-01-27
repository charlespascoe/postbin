import path from 'path';
import fs from 'fs';

const CONFIG_PATH = process.env['CONFIG_PATH'] || path.join(__dirname, 'configuration.json');

let configuration;

try {
  configuration = JSON.parse(fs.readFileSync(CONFIG_PATH));
} catch (e) {
  console.error(e);
  console.log(`Configuration file (${CONFIG_PATH}) not accessible or not valid JSON - using defaults`);
  configuration = {};
}

let dataDir = configuration.dataDir || '../data/';

if (!path.isAbsolute(dataDir)) {
  dataDir = path.join(__dirname, dataDir);
}

configuration.dataDir = dataDir;

configuration.protocol = configuration.protocol || 'http';
configuration.host = configuration.host || 'localhost:8080';

configuration.sizeLimit = configuration.sizeLimit || '16mb';

if (!/^\d+(k|m|g)?b$/i.test(configuration.sizeLimit)) {
  console.log(`Invalid sizeLimit (${configuration.sizeLimit}), defaulting to 16mb`);
  configuration.sizeLimit = '16mb';
}

export default configuration;
