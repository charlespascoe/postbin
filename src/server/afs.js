import fs from 'fs';

let afs = {};

for (let func in fs) {
  if (typeof fs[func] != 'function' || func.match(/Sync$/)) continue;

  (function (funcName) {
    afs[funcName] = function() {
      let args = [];

      for (let i in arguments) {
        args.push(arguments[i]);
      }

      return new Promise(function (fulfill, reject) {
        args.push(function (err, result) {
          if (err) {
            reject(err);
          } else {
            fulfill(result);
          }
        });

        fs[funcName].apply(undefined, args);
      });
    };
  })(func);
}

afs.constants = fs.constants;

export default afs;
