import { createTransaction } from '../module/transactionsRepository.js';
import { getOrCreateAccountCycle } from './accountCycles.service.js';
import { refreshCycleStatus } from './accountCycles.service.js';



//========================================
//Create Customer Transaction Function
//========================================
export const createCustomerTransaction = async (transaction) => {

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

    let cycle = null;

    // ============================================
    // Get Open Cycle
    // ============================================

    if (transaction.entityType && transaction.entityId) {

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

        transaction.cycleId = cycle.id;

    }

    // ============================================
    // Validate Cycle Balance
    // ============================================

    if (cycle) {

        const balance = await refreshCycleStatus(cycle.id);

        if (balance.totalOrders === 0) {

            throw {
                status: 422,
                message: 'Cannot register a payment because there are no orders in this cycle.'
            };

        }

        if (transaction.amount > balance.remaining) {

            throw {
                status: 422,
                message: 'Payment amount exceeds the remaining balance.'
            };

        }

    }

    // ============================================
    // Save Payment
    // ============================================

    const result = await createTransaction(transaction);

    // ============================================
    // Refresh Cycle Status
    // ============================================

    if (cycle) {

        await refreshCycleStatus(cycle.id);

    }

    


    return result;

};

