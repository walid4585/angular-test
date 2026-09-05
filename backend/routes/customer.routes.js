import express from 'express';

import {
  checkCustomerController,
  registerCustomerController,
  updateCustomerController,
  archiveCustomerController,
  getCustomerController,
  getCustomerDetailsController,
  getCustomersController,
  getCustomerCyclesHistoryController,
  getGeneralCustomerController,
} from '../controllers/customer.controller.js';

const router = express.Router();

// Must be declared before /:id.
router.get('/general', getGeneralCustomerController);

router.get(
  '/:id/history',
  getCustomerCyclesHistoryController
);

router.get('/:id/details', getCustomerDetailsController);
// ============================================
// ✅ Check Customer
// ============================================
router.post('/check', checkCustomerController);

// ============================================
// ✅ Register Customer
// ============================================
router.post('/', registerCustomerController);

// ============================================
// ✅ Get All Customers
// ============================================
router.get('/', getCustomersController);

// ============================================
// ✅ Get Customer By ID
// ============================================
router.get('/:id', getCustomerController);

// ============================================
// ✅ Update Customer
// ============================================
router.put('/:id', updateCustomerController);

// ============================================
// ✅ Archive Customer
// ============================================
router.patch('/:id/archive', archiveCustomerController);

export default router;
