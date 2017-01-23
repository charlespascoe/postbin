import { Router } from 'express';
import authenticator from 'server/authenticator';
import loggers from 'server/loggers';

const router = new Router();

router.use(authenticator.authenticate);

router.post('/bin', function (req, res) {
  loggers.main.debug(req.body);
  res.status(201).end();
});

export default function (app) {
  app.use('/', router);
};
