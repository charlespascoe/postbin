import { Router } from 'express';
import authenticator from 'server/authenticator';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import config from 'server/config';
import path from 'path';
import afs from 'server/afs';
import Utils from 'server/utils';

const catchHandler = catchAsync((err, req, res) => {
  loggers.main.error({err: err});
  res.status(500).end();
});

const router = new Router();

router.use(authenticator.authenticate);

router.get('/token', catchHandler(async function (req, res) {
  if (req.singleUseToken) {
    res.status(403).end('403 - Single-Use Token\n');
    return;
  }

  let token = await authenticator.createSingleUseToken();

  res.status(200).send(token + '\n');
}));

router.param('id', function (req, res, next) {
  if (!/^[a-z0-9_-]{1,64}$/i.test(req.params.id)) {
    res.status(400).send('400 - Bad ID\n');
    return;
  }

  next();
});

router.post('/bin/:id?', catchHandler(async function (req, res) {
  let id;

  if (req.params.id) {
    id = req.params.id;
  } else {
    let idBuff = await Utils.randomBytes(4);
    id = idBuff.toString('hex').match(/.{4}/g).join('-');
  }

  let filePath = path.join(config.dataDir, id);

  await afs.writeFile(filePath, req.data);

  res.status(201).send(id + '\n');
}));

router.get('/bin/:id', catchHandler(async function (req, res) {
  let content;
  try {
    content = await afs.readFile(path.join(config.dataDir, req.params.id));
  } catch (err) {
    if (err.code == 'ENOENT') {
      res.status(404).end('404 - Not found\n');
      return;
    }

    throw err;
  }

  if (req.query.encoding && /^(ascii|utf8|utf16le|ucs2|base64|hex)$/.test(req.query.encoding)) {
    content = content.toString(req.query.encoding);

    if (req.query.html) {
      content = '<pre>' + content.replace('<', '&lt;').replace('>', '&gt;') + '</pre>';
    }
  }

  res.status(200).send(content);
}));

export default function (app) {
  app.use('/', router);
};
