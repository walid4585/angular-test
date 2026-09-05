import express from 'express';
import {
  createTransactionController,
  getTransactionByIdController,
  searchTransactionsController,
  updateTransactionController,
  deleteTransactionController,
} from '../controllers/transactions.controller.js';
const router = express.Router();


router.post('/', createTransactionController);

router.get('/', searchTransactionsController);

router.get('/:id', getTransactionByIdController);

router.put('/:id', updateTransactionController);

router.delete('/:id', deleteTransactionController);


export default router;