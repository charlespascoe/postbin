export default class Utils {
  static defaults(defaults, additional) {
    return Object.assign(Utils.copy(defaults), additional);
  }

  static copy(obj) {
    return Object.assign({}, obj);
  }
}
