import { Router } from 'express';
import rootController from 'server/controllers/root-controller';
import loggers from 'server/loggers';
import perfMon from 'server/performance-monitor';

const router = new Router();

router.get('/token', perfMon.route('create-token', (req, res) => rootController.createToken(req, res)));

router.get('/about', perfMon.route('about', (req, res) => rootController.about(req, res)));

router.get('/stats', perfMon.route('stats', (req, res) => rootController.stats(req, res)));

export default router;
