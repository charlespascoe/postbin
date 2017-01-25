import crypto from 'crypto';

export default class Utils {
  static defaults(defaults, additional) {
    return Object.assign(Utils.copy(defaults), additional);
  }

  static copy(obj) {
    return Object.assign({}, obj);
  }

  static randomBytes(length) {
    return new Promise((fulfill, reject) => {
      crypto.randomBytes(length, (err, buff) => {
        if (err) {
          reject(err);
          return;
        }

        fulfill(buff);
      });
    });
  }

  static formatDataLength(length) {
    if (length < 1024) return `${length}B`;
    if (length < (1024 * 1024)) return `${(length / 1024).toFixed(2)}KiB`;
    if (length < (1024 * 1024 * 1024)) return `${(length / (1024 * 1024)).toFixed(2)}MiB`;
    return `${(length / (1024 * 1024 * 1024)).toFixed(2)}GiB`;
  }

  static escapeHtml(text) {
    return text.replace('<', '&lt;').replace('>', '&gt;');
  }
}
