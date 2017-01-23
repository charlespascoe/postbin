import bunyan from 'bunyan';
import Utils from 'server/utils';

const commonConfig = {
  level: bunyan.DEBUG,
  src: true
};

export default {
  main: bunyan.createLogger(Utils.defaults(commonConfig, {
    name: 'main'
  })),
  security: bunyan.createLogger(Utils.defaults(commonConfig, {
    name: 'security'
  }))
};
