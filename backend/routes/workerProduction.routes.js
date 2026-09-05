import express from 'express';

import {

    addProduction,

    getWorkerProduction,
    deleteProduction,
    updateProduction
}
from '../controllers/workerProduction.controller.js';

const router = express.Router();

// ============================================
// ✅ Add Production
// ============================================

router.post(

    '/',

    addProduction

);

// ============================================
// ✅ Get Worker Production
// ============================================

router.get(

    '/:workerId',

    getWorkerProduction

);

// ============================================
// ✅ Delete Production
// ============================================

router.delete(

    '/:id',

    deleteProduction

);

// ============================================
// ✅ Update Production
// ============================================

router.put(

    '/:id',

    updateProduction

);

export default router;