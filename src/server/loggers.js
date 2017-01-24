import bunyan from 'bunyan';
import Utils from 'server/utils';

const commonConfig = {
  serializers: {
    err: bunyan.stdSerializers.err,
    ip: (ip) => ip.match(/^::ffff:/) ? ip.substring(7) : ip
  },
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
