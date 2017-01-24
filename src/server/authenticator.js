import config from 'server/config';
import loggers from 'server/loggers';
import Utils from 'server/utils';

const singleUseTokenLength = 4,
      expiryPeriod = 5 * 60 * 1000;

class Authenticator {
  constructor(loggers, config) {
    this.singleUseTokens = [];
    this.loggers = loggers;
    this.users = config.users;
    this.authenticate = this.authenticate.bind(this);
  }

  checkCredentials(username, password) {
    return (
      typeof username == 'string' &&
      typeof password == 'string' &&
      /^[A-Za-z0-9]+$/.test(username) &&
      this.users[username] &&
      this.users[username].password == password
    );
  }

  async createSingleUseToken() {
    let tokenKeyBuf = await Utils.randomBytes(singleUseTokenLength),
        tokenKey = tokenKeyBuf.toString('hex').match(/.{4}/g).join('-');

    this.singleUseTokens.push({
      key: tokenKey,
      expires: Date.now() + expiryPeriod
    });

    return tokenKey;
  }

  authenticate(req, res, next) {
    let authHeader = req.headers.authorization;

    req.singleUseToken = false;

    let unauthenticated = (reason) => {
      this.loggers.security.warn({ip: req.clientIp, reason: reason}, 'Unauthenticated request attempt');
      res.setHeader('WWW-Authenticate', 'Basic');
      res.status(401).send('401 - Authentication required\n');
    };

    if (typeof authHeader != 'string') {
      unauthenticated('No authentication offered');
      return;
    }

    let basicAuthRegex = /^Basic ((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4}))$/,
        bearerAuthRegex = /^Bearer ([a-f0-9-]+)$/;

    let match = authHeader.match(basicAuthRegex);

    if (match) {
      let userPass = Buffer.from(match[1], 'base64').toString('utf-8').split(/:(.+)/);

      if (userPass[0] === 'token') {
        authHeader = `Bearer ${userPass[1]}`;
      } else if (this.checkCredentials(userPass[0], userPass[1])) {
        next();
        return;
      } else {
        unauthenticated('Basic auth: Invalid or incorrect username and password');
        return;
      }
    }

    match = authHeader.match(bearerAuthRegex);

    if (match) {
      let singleUseToken = match[1];

      let token = this.singleUseTokens.find(tok => tok.key == singleUseToken);

      if (token == null) {
        unauthenticated('Single Use Token: Non-existent token');
      } else if (token.expires < Date.now()) {
        unauthenticated('Single Use Token: Expired token');
      } else {
        req.singleUseToken = true;
        next();
      }

      this.singleUseTokens = this.singleUseTokens.filter(tok => tok.key != singleUseToken);

      return;
    }

    unauthenticated('No acceptable authentication provided');
  }
}

export default new Authenticator(loggers, config);
