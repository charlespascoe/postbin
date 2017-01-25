import { Router } from 'express';
import authenticator from 'server/authenticator';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import config from 'server/config';
import path from 'path';
import afs from 'server/afs';
import Utils from 'server/utils';
import File from 'server/file';

const catchHandler = catchAsync((err, req, res) => {
  loggers.main.error({err: err});
  res.message(500, 'Internal server error');
});

const router = new Router();

router.use(authenticator.authenticate);

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

router.param('id', function (req, res, next) {
  if (!/^[a-z0-9_-]{1,64}$/i.test(req.params.id)) {
    res.message(400, 'Bad ID');
    return;
  }

  next();
});

router.post('/bin/:id?', catchHandler(async function (req, res) {
  if (req.singleUseToken && req.singleUseToken.readonly) {
    res.message(403, 'Read-only token cannot post data');
    return;
  }

  let id;

  if (req.params.id) {
    id = req.params.id;
  } else {
    let idBuff = await Utils.randomBytes(4);
    id = idBuff.toString('hex').match(/.{4}/g).join('-');
  }

  loggers.main.debug(`Attempting to save '${id}' file (size: ${Utils.formatDataLength(req.data.length)})`);

  let file = new File(id);

  await file.save(req.data);

  loggers.main.info(`Successfully created '${id}' entity`);

  if (req.query.link) {
    let token = await authenticator.createSingleUseToken(true);

    let url = file.createLink(token, req.query.encoding, req.query.html);

    res.status(201).send(url + '\n');
  } else {
    res.status(201).send(id + '\n');
  }
}));

router.get('/bin/', catchHandler(async function (req, res) {
  loggers.main.debug('Listing files...');
  let files = await File.listAllFiles();
  loggers.main.info(`Listed ${files.length} files`);

  let list;

  if (req.query.html) {
    list = '<ul>' + files.map(file => file.formatHtmlEntry(req.query.encoding)).join('') + '</ul>'
  } else {
    list = files.map(file => file.id).join('\n');
  }

  res.status(200).send(list + '\n');
}));

router.get('/bin/:id', catchHandler(async function (req, res) {
  let file = new File(req.params.id);

  let content;

  try {
    content = await file.load();
  } catch (err) {
    if (err.code == 'ENOENT') {
      loggers.main.warn(`Entity not found: ${req.params.id}`);
      res.message(404, 'Not found');
      return;
    }

    throw err;
  }

  if (req.query.encoding && /^(ascii|utf8|utf16le|ucs2|base64|hex)$/.test(req.query.encoding)) {
    content = content.toString(req.query.encoding);

    if (req.query.html) {
      content = '<pre>' + Utils.escapeHtml(content) + '</pre>';
    }
  }

  res.status(200).send(content);
}));

export default function (app) {
  app.use('/', router);
};
