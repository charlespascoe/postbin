import { Router } from 'express';
import authenticator from 'server/authenticator';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import config from 'server/config';

const catchHandler = catchAsync((err, req, res) => {
  loggers.main.error({err: err});
  res.message(500, 'Internal server error');
});

const router = new Router();

router.get('/token', catchHandler(async function (req, res) {
  if (req.singleUseToken) {
    loggers.security.warn('Attempt to create a single-use token using a single-use token');
    res.message(403, 'Single-Use Token can\'t create more tokens');
    return;
  }

  loggers.security.debug('Attempting to create token...');

  let token = await authenticator.createSingleUseToken(req.query.readonly);

  res.status(200).send(token + '\n');
}));


router.get('/about', function (req, res) {
  res.status(200).send(`Version: ${config.version}\n`);
});

export default router;
