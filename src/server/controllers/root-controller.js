import loggers from 'server/loggers';
import authenticator from 'server/authenticator';
import config from 'server/config';
import perfMon from 'server/performance-monitor';
import Utils from 'server/utils';
import Table from 'server/table';

export class RootController {
  constructor(loggers, config, authenticator, perfMon) {
    this.loggers = loggers;
    this.config = config;
    this.authenticator = authenticator;
    this.perfMon = perfMon;
  }

  async createToken(req, res) {
    if (req.singleUseToken) {
      this.loggers.security.warn('Attempt to create a single-use token using a single-use token');
      res.message(403, 'Single-Use Token can\'t create more tokens');
      return;
    }

    this.loggers.security.debug('Attempting to create token...');

    let token = await this.authenticator.createSingleUseToken(req.query.readonly);

    res.status(200).send(token + '\n');
  }

  async about(req, res) {
    res.status(200).send(`Version: ${this.config.version}\n`);
  }

  async stats(req, res) {
    this.loggers.main.debug('Loading stats...');

    let data = await this.perfMon.loadData();

    let results = data
      .filter(item => item.type == 'route')
      .reduce((obj, item) => {
        if (!obj[item.tag]) obj[item.tag] = {count: 0,totalDur: 0};
        obj[item.tag].count++;
        obj[item.tag].totalDur += item.dur;
        return obj;
      }, {});

    let table = new Table(['Route', 'Calls', 'Avg. Dur']);

    for (let tag in results) {
      table.addRow([tag, results[tag].count, Math.round(results[tag].totalDur / results[tag].count)]);
    }

    table.sort((rowA, rowB) => rowB[2] - rowA[2]);

    let formattedTable = table.toString(' | ');

    if (req.query.html) {
      formattedTable = '<pre>' + Utils.escapeHtml(formattedTable) + '</pre>';
    }

    res.status(200).send(formattedTable);

    this.loggers.main.info('Loaded stats');
  }
}

export default new RootController(loggers, config, authenticator, perfMon);
