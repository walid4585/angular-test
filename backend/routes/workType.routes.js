import express from 'express';

import {

    getWorkTypes,

    getWorkTypeById,

    createWorkType,

    updateWorkType,

    archiveWorkType

} from '../controllers/workType.controller.js';

const router = express.Router();

// ============================================
// ✅ Get All Work Types
// ============================================

router.get(

    '/',

    getWorkTypes

);

// ============================================
// ✅ Get Work Type By Id
// ============================================

router.get(

    '/:id',

    getWorkTypeById

);

// ============================================
// ✅ Create Work Type
// ============================================

router.post(

    '/',

    createWorkType

);

// ============================================
// ✅ Update Work Type
// ============================================

router.put(

    '/:id',

    updateWorkType

);

// ============================================
// ✅ Archive Work Type
// ============================================

router.patch(

    '/:id',

    archiveWorkType

);

export default router;