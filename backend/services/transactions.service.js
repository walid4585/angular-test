import {
  getTransactionById,
  searchTransactions,
  updateTransaction,
  deleteTransaction,
} from '../module/transactionsRepository.js';
import {
  refreshCycleStatus
} from '../services/accountCycles.service.js';

import { createWorkerTransaction } from './worker-transactions.service.js';

import { createCustomerTransaction } from './customer-transaction.service.js';


export const createTransactionService = async (transaction) => {

    console.log('create transaction start >>>>>>');

    // ============================================
    // Validate Amount
    // ============================================

    if (!transaction.amount || transaction.amount <= 0) {

        throw {
            status: 400,
            message: 'Payment amount must be greater than zero.'
        };

    }

    // ============================================
    // Route Transaction By Entity Type
    // ============================================

    switch (transaction.entityType) {

        case 'customer':
            return await createCustomerTransaction(transaction);

        case 'worker':
            return await createWorkerTransaction(transaction);

        default:
            throw {
                status: 400,
                message: `Unsupported transaction type: ${transaction.entityType}`
            };

    }

};
export const getTransactionByIdService = async (id) => {
  return await getTransactionById(id);
};

export const searchTransactionsService = async (filters) => {
  return await searchTransactions(filters);
};

export const updateTransactionService = async (id, data) => {

    const transaction = await updateTransaction(id, data);

   console.log(transaction);
console.log(transaction.cycleId);
   await refreshCycleStatus(transaction.cycleId);

    return transaction;

};

export const deleteTransactionService = async (id) => {
  return await deleteTransaction(id);
};