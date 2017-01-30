import authenticator from 'server/authenticator';
import binRouter from 'server/routers/bin';
import rootRouter from 'server/routers/root';

export default function routers(app) {
  app.use(authenticator.authenticate);
  app.use('/bin', binRouter);
  app.use('/', rootRouter);
};
