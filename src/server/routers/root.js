import { Router } from 'express';
import rootController from 'server/controllers/root-controller';
import loggers from 'server/loggers';
import catchAsync from 'server/catch-async';

const catchHandler = catchAsync((err, req, res) => {
  loggers.main.error({err: err});
  res.message(500, 'Internal server error');
});

const router = new Router();

router.get('/token', catchHandler((req, res) => rootController.createToken(req, res)));

router.get('/about', catchHandler((req, res) => rootController.about(req, res)));

export default router;
