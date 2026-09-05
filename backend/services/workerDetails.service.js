// ============================================
// Imports
// ============================================
import { getWorkerById } from '../module/workersRepository.js';

import { getOpenAccountCycle } from '../module/accountCyclesRepository.js';

import { getPaymentsByCycle } from '../module/transactionsRepository.js';

import { calculateCycleBalance } from './accountCycles.service.js';

import { getAccountCycles } from '../module/accountCyclesRepository.js';

import { getWorkerProductionByCycle } from '../module/workerProductionRepository.js';



// ============================================
// Get Worker Details
// ============================================

export const getWorkerDetails = async (workerId) => {
    
    
      const worker = await getWorkerById(workerId);
    
      

   

    if (!worker) {
        throw new Error('Worker not found');
    }

    const currentCycle = await getOpenAccountCycle(
        'worker',
        workerId
    );
   
    let productions = [];
    let payments = [];
    let balance = null;

    if (currentCycle) {

        productions = await getWorkerProductionByCycle(
            currentCycle.id
        );

       payments = await getPaymentsByCycle(
        currentCycle.id,
             'worker',
              'OUT'
             );
        balance = await calculateCycleBalance(
            currentCycle.id
        );
    }
    console.log({
        worker,
        currentCycle,
        productions,
        payments,
        balance
    });

    return {

        worker,

        currentCycle,

        productions,

        payments,

        balance

    };
    

};
// ============================================
// Get Worker Cycles History
// ============================================

export const getWorkerCyclesHistory = async (workerId) => {

    const cycles = await getAccountCycles(
        'worker',
        workerId
    );

    for (const cycle of cycles) {

        cycle.productions = await getWorkerProductionByCycle(
            cycle.id
        );

        cycle.payments = await getPaymentsByCycle(
            cycle.id,
            'worker',
            'OUT'
        );

        cycle.balance = await calculateCycleBalance(
            cycle.id
        );

    }

    return cycles;

};