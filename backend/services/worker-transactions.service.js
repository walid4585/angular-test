import { createTransaction } from '../module/transactionsRepository.js';
import { getWorkerById } from '../module/workersRepository.js';
import {
    getOrCreateAccountCycle,
    calculateCycleBalance,
    refreshCycleStatus,
    getOpenAccountCycle
} from './accountCycles.service.js';

//========================================
// Create Worker Transaction Function
//========================================
export const createWorkerTransaction = async (transaction) => {

    if (!transaction.amount || transaction.amount <= 0) {
        throw {
            status: 400,
            message: 'Payment amount must be greater than zero.'
        };
    }

    let cycle = null;
    let worker = null;

    if (transaction.entityType && transaction.entityId) {

        worker = await getWorkerById(transaction.entityId);

        if (!worker) {
            throw {
                status: 404,
                message: 'Worker not found.'
            };
        }

       if (worker.paymentType === 'monthly') {

    // Monthly workers must have an explicitly started cycle.
    cycle = await getOpenAccountCycle(
        transaction.entityType,
        transaction.entityId
    );

    if (!cycle) {
        throw {
            status: 422,
            message: 'Worker has no open cycle. Please start the cycle first.'
        };
    }

} else {

    // Piece / tailor workers keep the existing behavior.
    cycle = await getOrCreateAccountCycle(
        transaction.entityType,
        transaction.entityId
    );

    if (!cycle) {
        throw {
            status: 404,
            message: 'Account cycle not found.'
        };
    }

}

transaction.cycleId = cycle.id;
    }

    if (cycle) {

        // Monthly workers are paid against their monthly salary, while
        // piece/tailor workers are paid against recorded production.
        const balance = await calculateCycleBalance(cycle.id);

        if (worker.paymentType !== 'monthly' && balance.totalProduction === 0) {
            throw {
                status: 422,
                message: 'There is no production recorded for this worker.'
            };
        }

        if (worker.paymentType === 'monthly') {
            if (transaction.amount > balance.remaining) {
                throw {
                    status: 422,
                    message: 'Payment exceeds the worker balance.'
                };
            }
        } else {
            // For piece/tailor workers, we need to ensure the payment does not exceed production.
            if (transaction.amount > balance.totalProduction) {
                throw {
                    status: 422,
                    message: 'Payment exceeds the worker production.'
                };
            }
        }
    }

  
    const result = await createTransaction(transaction);
   

    if (cycle) {
        
        await refreshCycleStatus(cycle.id);
    }
 

    return result;
};
