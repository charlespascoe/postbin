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
}
