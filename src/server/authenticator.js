import config from 'server/config';
import loggers from 'server/loggers';
import Utils from 'server/utils';
import afs from 'server/afs';
import htpasswd from 'htpasswd-auth';
import catchAsync from 'server/catch-async';

const singleUseTokenLength = 4,
      expiryPeriod = 5 * 60 * 1000;

const catchHandler = catchAsync((err, req, res) => {
  loggers.security.error({err: err}, 'An error occurred during authentication');
  res.message(500);
});

class Authenticator {
  constructor(loggers, config, afs) {
    this.singleUseTokens = [];
    this.loggers = loggers;
    this.config = config;
    this.afs = afs;
    this.authenticate = catchHandler(this.authenticate.bind(this));
  }

  async checkCredentials(username, password) {
    this.loggers.security.debug('Checking user credentials...');
    let start = Date.now();

    let htpasswdFile;

    try {
      htpasswdFile = await this.afs.readFile(this.config.auth, 'utf8');
    } catch (err) {
      if (err.code == 'ENOENT') {
        this.loggers.security.info(`No htpasswd file found, password login disabled (auth path: '${this.config.auth}')`);
        this.htpasswdFile = '';
      } else {
        throw err;
      }
    }

    if (typeof username != 'string' || typeof password != 'string' || !/^[A-Za-z0-9]+$/.test(username)) return false;

    let result = await htpasswd.authenticate(username, password, htpasswdFile);

    this.loggers.security.debug(`User Credential Check: ${result} (${Date.now() - start}ms)`);

    return result;
  }

  async createSingleUseToken(readonly) {
    let tokenKeyBuf = await Utils.randomBytes(singleUseTokenLength),
        tokenKey = tokenKeyBuf.toString('hex').match(/.{4}/g).join('-');

    this.singleUseTokens.push({
      key: tokenKey,
      expires: Date.now() + expiryPeriod,
      readonly: readonly
    });

    loggers.security.info(`Created new single-use token: ${tokenKey} (readonly: ${readonly ? true : false})`);

    return tokenKey;
  }

  async authenticate(req, res, next) {
    let authHeader = req.headers.authorization;

    req.singleUseToken = false;

    let unauthenticated = (reason) => {
      this.loggers.security.warn({ip: req.clientIp, reason: reason}, 'Unauthenticated request attempt');
      res.setHeader('WWW-Authenticate', 'Basic');
      res.message(401, 'Authentication required');
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
      } else {
        let authenticated;

        try {
          authenticated = await this.checkCredentials(userPass[0], userPass[1]);
        } catch (err) {
          this.loggers.security.error({err: err}, 'Error occurred when authenticating a user via basic auth');
          res.message(500);
          return;
        }

        if (authenticated) {
          next();
        } else {
          unauthenticated('Basic auth: Invalid or incorrect username and password');
        }

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
        req.singleUseToken = token;
        next();
      }

      this.singleUseTokens = this.singleUseTokens.filter(tok => tok.key != singleUseToken);

      return;
    }

    unauthenticated('No acceptable authentication provided');
  }
}

export default new Authenticator(loggers, config, afs);
