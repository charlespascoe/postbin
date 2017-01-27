import 'source-map-support/register';
import routers from 'server/routers';
import express from 'express';
import config from 'server/config';
import loggers from 'server/loggers';
import rawBody from 'raw-body';
import afs from 'server/afs';

const port = config.port || 8080;
const app = express();

app.use(function (req, res, next) {
  req.clientIp = req.ip;

  if (config.xForwardedFor) {
    req.clientIp = req.headers['x-forwarded-for'] || req.ip;
  }

  res.message = (statusCode, message) => {
    res.status(statusCode).send(`${statusCode} - ${statusCode == 500 ? 'Internal server error' : message}\n`);
  };

  next();
});

app.use(function (err, req, res, next) {
  loggers.main.error({err: err});

  let statusCode = err.statusCode || 500,
      message = (statusCode == 500 ? null : err.message) || 'Internal server error';

  res.message(statusCode, message);
});

app.disable('x-powered-by');

app.use(function (req, res, next) {
  rawBody(req, {
    limit: config.sizeLimit
  }, function (err, buff) {
    if (err) {
      if (400 <= err.statusCode && err.statusCode < 500) {
        loggers.main.warn({reason: err.message}, 'Warning when parsing data');
      } else {
        loggers.main.error({err: err}, 'Failed to parse data');
      }
      res.message(err.statusCode || 500, err.message);
      return;
    }
    req.data = buff;
    next();
  });
});

routers(app);

(async function main() {
  try {
    await afs.mkdir(config.dataDir);
  } catch (err) {
    if (err.code != 'EEXIST') throw err;
  }

  app.listen(port, (err) => err ? loggers.main.fatal({err: err}) : loggers.main.info(`Listening on port ${port}`));
})().catch(err => logger.main.fatal({err: err}));
