import 'source-map-support';
import routers from 'server/routers';
import express from 'express';
import config from 'server/config';
import loggers from 'server/loggers';
import bodyParser from 'body-parser';

const port = config.port || 8080;
const app = express();

app.disable('x-powered-by');

app.use(bodyParser.text());

routers(app);

app.listen(port, (err) => err ? loggers.main.fatal(err) : loggers.main.info(`Listening on port ${port}`));
