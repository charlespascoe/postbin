import loggers from 'server/loggers';
import authenticator from 'server/authenticator';
import config from 'server/config';

export class RootController {
  constructor(loggers, config, authenticator) {
    this.loggers = loggers;
    this.config = config;
    this.authenticator = authenticator;
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
}

export default new RootController(loggers, config, authenticator);
