import afs from 'server/afs';
import config from 'server/config';
import path from 'path';
import Utils from 'server/utils';

export default class File {
  constructor(id) {
    this.id = id;
    this.path = path.join(config.dataDir, id);
  }

  static isValidId(id) {
    return /^[a-z0-9_-]{1,64}$/i.test(id);
  }

  static async listAllFiles() {
    let files = await afs.readdir(config.dataDir);

    return files.sort().map(fileId => new File(fileId));
  }

  async save(data) {
    await afs.writeFile(this.path, data);
  }

  async load(encoding = null) {
    let data = await afs.readFile(this.path);

    if (encoding) {
      return data.toString(encoding);
    } else {
      return data;
    }
  }

  async delete() {
    await afs.unlink(this.path);
  }

  createLink(token, encoding = null, html = null) {
    let link = `${config.protocol}://token:${token}@${config.host}/bin/${this.id}`;

    if (encoding) {
      link += `?encoding=${encodeURIComponent(encoding)}`;

      if (html) link += '&html=true';
    }

    return link;
  }

  formatHtmlEntry(encoding) {
    encoding = encoding || 'utf8';
    let url = `${config.protocol}://${config.host}/bin/${this.id}`;
    return `<li><a href="${url}?encoding=${encodeURIComponent(encoding)}&html=true" target="_blank">${Utils.escapeHtml(this.id)}</a> (<a href="${url}" rel="nofollow">Download</a>)</li>`;
  }
}

