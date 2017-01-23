import configuration from 'server/configuration';
import path from 'path';

let dataDir = configuration.dataDir || '../data/';

if (!path.isAbsolute(dataDir)) {
  dataDir = path.join(__dirname, dataDir);
}

configuration.dataDir = dataDir;

export default configuration;
