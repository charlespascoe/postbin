import 'source-map-support';
import routers from 'server/routers';
import express from 'express';
import config from 'server/config';
import loggers from 'server/loggers';
import rawBody from 'raw-body';

const port = config.port || 8080;
const app = express();

app.disable('x-powered-by');

app.use(function (req, res, next) {
  rawBody(req, {
    limit: '16mb'
  }, function (err, buff) {
    if (err) {
      loggers.main.error({err: err}, 'Failed to parse data');
      res.status(err.statusCode || 500).send(err.statusCode ? `${err.statusCode} - ${err.message}\n` : '500 - internal server error');
      return;
    }
    req.data = buff;
    next();
  });
});

routers(app);

app.listen(port, (err) => err ? loggers.main.fatal(err) : loggers.main.info(`Listening on port ${port}`));
