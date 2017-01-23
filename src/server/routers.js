import { Router } from 'express';
import authenticator from 'server/authenticator';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';

const catchHandler = catchAsync((err, req, res) => {
  loggers.main.error({err: err});
  res.status(500).end();
});

const router = new Router();

router.use(authenticator.authenticate);

router.get('/token', catchHandler(async function (req, res) {
  if (req.singleUseToken) {
    res.status(403).end();
    return;
  }

  var token = await authenticator.createSingleUseToken();

  res.status(200).send(token + '\n');
}));

router.post('/bin', function (req, res) {
  loggers.main.debug(req.body);
  res.status(201).end();
});

export default function (app) {
  app.use('/', router);
};
