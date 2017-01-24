import { Router } from 'express';
import authenticator from 'server/authenticator';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import config from 'server/config';
import path from 'path';
import afs from 'server/afs';

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

  let token = await authenticator.createSingleUseToken();

  res.status(200).send(token + '\n');
}));

router.post('/bin', catchHandler(async function (req, res) {
  let id = Date.now().toString(),
      filePath = path.join(config.dataDir, id);

  await afs.writeFile(filePath, req.body);

  res.status(201).send(id + '\n');
}));

router.get('/bin/:id', catchHandler(async function (req, res) {
  if (!/^\d+$/.test(req.params.id)) {
    res.status(400).end();
    return;
  }

  let content;
  try {
    content = await afs.readFile(path.join(config.dataDir, req.params.id));
  } catch (err) {
    if (err.code == 'ENOENT') {
      res.status(404).end();
      return;
    }

    throw err;
  }

  if (!req.query.nonewline) {
    content += '\n';
  }

  res.status(200).send(content);
}));

export default function (app) {
  app.use('/', router);
};
