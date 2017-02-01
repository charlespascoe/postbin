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

let perfStatsFile = configuration.perfStatsFile || '../perf-stats.txt';

if (!path.isAbsolute(perfStatsFile)) {
  perfStatsFile = path.join(__dirname, perfStatsFile);
}

configuration.perfStatsFile = perfStatsFile;

configuration.protocol = configuration.protocol || 'http';
configuration.host = configuration.host || 'localhost:8080';

configuration.sizeLimit = configuration.sizeLimit || '16mb';

if (!/^\d+(k|m|g)?b$/i.test(configuration.sizeLimit)) {
  console.log(`Invalid sizeLimit (${configuration.sizeLimit}), defaulting to 16mb`);
  configuration.sizeLimit = '16mb';
}

configuration.logLevel = configuration.logLevel || 'INFO';

if (!/^(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)$/.test(configuration.logLevel)) {
  console.log(`Invalid logLevel (${configuration.logLevel}), defaulting to INFO`);
  configuration.logLevel = 'INFO';
}

configuration.version = configuration.version || process.env['VERSION'] || 'DEV';

export default configuration;
