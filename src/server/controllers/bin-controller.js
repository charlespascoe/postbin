import { Router } from 'express';
import loggers from 'server/loggers';
import Utils from 'server/utils';
import File from 'server/file';

export class BinController {
  constructor(loggers) {
    this.loggers = loggers;
  }

  async createFile(req, res) {
    if (req.singleUseToken && req.singleUseToken.readonly) {
      this.loggers.security.warn('Attempt to create file using a read-only token');
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

    this.loggers.main.debug(`Attempting to save '${id}' file (size: ${Utils.formatDataLength(req.data.length)})`);

    let file = new File(id);

    await file.save(req.data);

    this.loggers.main.info(`Successfully created '${id}' entity`);

    if (req.query.link) {
      let token = await authenticator.createSingleUseToken(true);

      let url = file.createLink(token, req.query.encoding, req.query.html);

      res.status(201).send(url + '\n');
    } else {
      res.status(201).send(id + '\n');
    }
  }

  async listFiles(req, res) {
    this.loggers.main.debug('Listing files...');
    let files = await File.listAllFiles();
    this.loggers.main.info(`Listed ${files.length} files`);

    let list;

    if (req.query.html) {
      list = '<ul>' + files.map(file => file.formatHtmlEntry(req.query.encoding)).join('') + '</ul>'
    } else {
      list = files.map(file => file.id).join('\n');
    }

    res.status(200).send(list + '\n');
  }

  async getFile(req, res) {
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

    if (req.method == 'DELETE') {
      await file.delete();
    }

    if (req.query.encoding && /^(ascii|utf8|utf16le|ucs2|base64|hex)$/.test(req.query.encoding)) {
      content = content.toString(req.query.encoding);

      if (req.query.html) {
        content = '<pre>' + Utils.escapeHtml(content) + '</pre>';
      }
    }

    res.status(200).send(content);
  }
}

export default new BinController(loggers);
