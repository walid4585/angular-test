import express from 'express';
import * as workersController from '../controllers/workers.controller.js';

const router = express.Router();

router.post('/', workersController.createWorker);

router.get('/', workersController.getWorkers);

router.get('/:id', workersController.getWorkerById);

router.get(
    '/:id/details',
    workersController.getWorkerDetailsController
);

router.get(
    '/:id/cycles',
    workersController.getWorkerCyclesHistoryController
);

export default router;