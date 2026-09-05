import {
  getOrdersController,
  addOrderController,
  removeOrderController,
  editOrderController,
} from '../controllers/orders.controller.js';
import express from 'express';
const router = express.Router();
//=============================================
// ✅ Orders Routes
//=============================================

router.get('/', getOrdersController);
//=============================================
// ✅ Add Order
//=============================================
router.post('/', addOrderController);
//=============================================
// ✅ Remove Order
//=============================================
router.delete('/:id', removeOrderController);
//============================================
//✅ Update Order
//============================================
router.put('/:id', editOrderController);





export default router;
