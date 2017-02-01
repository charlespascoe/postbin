import { Router } from 'express';
import loggers from 'server/loggers';
import File from 'server/file';
import binController from 'server/controllers/bin-controller';
import perfMon from 'server/performance-monitor';

const router = new Router();

router.param('id', function (req, res, next) {
  if (!File.isValidId(req.params.id)) {
    res.message(400, 'Bad ID');
    return;
  }

  next();
});

router.post('/:id?', perfMon.route('bin/create', (req, res) => binController.createFile(req, res)));

router.get('/', perfMon.route('bin/list', (req, res) => binController.listFiles(req, res)));

router.route('/:id')
  .get(perfMon.route('bin/get', (req, res) => binController.getFile(req, res)))
  .delete(perfMon.route('bin/delete', (req, res) => binController.getFile(req, res)));

export default router;
