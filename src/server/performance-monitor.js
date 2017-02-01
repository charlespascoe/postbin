import afs from 'server/afs';
import loggers from 'server/loggers';
import config from 'server/config';

export class PerformanceMonitor {
  constructor(loggers, config, afs) {
    this.loggers = loggers;
    this.config = config;
    this.afs = afs;
    this.buffer = [];
  }

  route(tag, handler) {
    return async (req, res) => {
      let start = Date.now();

      try {
        await handler(req, res);
      } catch (err) {
        this.errorHandler(err, req, res);
        return;
      }

      let duration = Date.now() - start;

      this.appendToLog({
        type: 'route',
        tag: tag,
        dur: duration
      });
    };
  }

  appendToLog(data) {
    data.time = Date.now();
    this.buffer.push(data);
    this.writeToFile();
  }

  async writeToFile() {
    if (this.isWriting || this.buffer.length == 0) return;

    this.isWriting = true;

    let data = this.buffer.map(d => JSON.stringify(d)).join('\n') + '\n';

    this.buffer = [];

    try {
      await this.afs.appendFile(this.config.perfStatsFile, data);
    } catch (err) {
      this.loggers.main.error(err);
    }

    this.isWriting = false;

    if (this.buffer.length > 0) this.writeToFile();
  }

  async loadData() {
    let data;

    try {
      data = await this.afs.readFile(this.config.perfStatsFile, 'utf8');
    } catch (err) {
      if (err.code == 'ENOENT') return [];
      throw err;
    }

    return data.split('\n').filter(json => json.length > 0).map(json => JSON.parse(json));
  }

  errorHandler(err, req, res) {
    res.status(500).send();
  }
}

export default new PerformanceMonitor(loggers, config, afs);
