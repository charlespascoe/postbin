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

configuration.version = configuration.version || process.env['VERSION'] || 'DEV';

// ===== PATHS =====

function absPath(conf, key, defaultValue) {
  let pathValue = conf[key] || defaultValue;

  if (!path.isAbsolute(pathValue)) {
      pathValue = path.join(__dirname, pathValue);
  }

  conf[key] = pathValue;
}

absPath(configuration, 'dataDir', '../data');

absPath(configuration, 'perfStatsFile', '../perf-stats.txt');

absPath(configuration, 'auth', process.env['HTPASSWD_FILE'] || '../htpasswd');

// ===== HOST INFO =====

configuration.protocol = configuration.protocol || 'http';
configuration.host = configuration.host || 'localhost:8080';

// ===== UPLOAD LIMIT =====

configuration.sizeLimit = configuration.sizeLimit || '16mb';

if (!/^\d+(k|m|g)?b$/i.test(configuration.sizeLimit)) {
  console.log(`Invalid sizeLimit (${configuration.sizeLimit}), defaulting to 16mb`);
  configuration.sizeLimit = '16mb';
}

// ===== LOGGING =====

configuration.logLevel = configuration.logLevel || 'INFO';

if (!/^(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)$/.test(configuration.logLevel)) {
  console.log(`Invalid logLevel (${configuration.logLevel}), defaulting to INFO`);
  configuration.logLevel = 'INFO';
}

export default configuration;
