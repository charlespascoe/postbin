import { Router } from 'express';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';
import File from 'server/file';
import binController from 'server/controllers/bin-controller';

const catchHandler = catchAsync((err, req, res) => {
  loggers.main.error({err: err});
  res.message(500, 'Internal server error');
});

const router = new Router();

router.param('id', function (req, res, next) {
  if (!File.isValidId(req.params.id)) {
    res.message(400, 'Bad ID');
    return;
  }

  next();
});

router.post('/:id?', catchHandler((req, res) => binController.createFile(req, res)));

router.get('/', catchHandler((req, res) => binController.listFiles(req, res)));

router.route('/:id')
  .get(catchHandler((req, res) => binController.getFile(req, res)))
  .delete(catchHandler((req, res) => binController.getFile(req, res)));

export default router;
