import express from 'express';

import {
  startAccountCycleController
} from '../controllers/accountCycles.controller.js';

const router = express.Router();

router.post('/start', startAccountCycleController);

export default router;