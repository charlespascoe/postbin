import configuration from 'server/configuration';
import path from 'path';

let dataDir = configuration.dataDir || '../data/';

if (!path.isAbsolute(dataDir)) {
  dataDir = path.join(__dirname, dataDir);
}

configuration.dataDir = dataDir;

configuration.protocol = configuration.protocol || 'http';
configuration.host = configuration.host || 'localhost:8080';

export default configuration;
