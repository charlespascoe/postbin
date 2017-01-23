export default function catchAsync(handler) {
  return function catchHandler(asyncFunc) {
    return function wrapper(...args) {
      asyncFunc(...args).catch((err) => handler(err, ...args));
    }
  }
};
