// ============================================
// Imports
// ============================================

import {
  createAccountCycle,
  getOpenAccountCycle as getOpenAccountCycleRepository,
  getAccountCycleById,
  getAccountCycles,
  closeAccountCycle,
  reopenAccountCycle
} from '../module/accountCyclesRepository.js';
import {

  getOrdersTotalByCycle

} from '../module/orderRepository.js';

import {

  getPaymentsTotalByCycle

} from '../module/transactionsRepository.js';
import {

  getWorkerProductionTotalByCycle
} from '../module/workersRepository.js';
import {
  getWorkerById
} from '../module/workersRepository.js';



// ============================================
// Get Open Account Cycle
// ============================================

export const getOpenAccountCycle = async (
  accountType,
  entityId
) => {

  return await getOpenAccountCycleRepository(
    accountType,
    entityId
  );

};


// ============================================
// Refresh Cycle Status
// ============================================

export const refreshCycleStatus = async (cycleId) => {

  const cycle = await getAccountCycleById(cycleId);

  if (!cycle) {

    throw new Error('Cycle not found.');

  }

  const balance = await calculateCycleBalance(cycleId);
    

 if (balance.isPaid && cycle.status === 'open') {

    console.log('Closing cycle...');

    await closeAccountCycle(
        cycleId,
        new Date().toISOString()
    );

    const updated = await getAccountCycleById(cycleId);

    console.log('Updated cycle:', updated);
}

  if (!balance.isPaid && cycle.status === 'closed') {

    await reopenAccountCycle(cycleId);

  }
  

  return balance;

};






// ============================================
// Get Or Create Account Cycle
// ============================================

export const getOrCreateAccountCycle = async (

  accountType,
  entityId

) => {

  // Search for an open cycle

  let cycle = await getOpenAccountCycle(

    accountType,
    entityId

  );

  // Return existing cycle

  if (cycle) {

    return cycle;

  }

  // Create new cycle

  const cycleId = await createAccountCycle({

    accountType,

    entityId,

    status: 'open',

    openedAt: new Date().toISOString()

  });

  // Return created cycle

  return await getAccountCycleById(cycleId);


};

/*===========================================
Calculate Customer Balance
============================================*/

const calculateCustomerBalance = async (cycleId) => {
  const totalOrders = await getOrdersTotalByCycle(cycleId);
  const totalPayments = await getPaymentsTotalByCycle(
    cycleId,
    'customer',
    'IN'
);

  const remaining = totalOrders - totalPayments;

  return {
    totalOrders,
    totalPayments,
    remaining,
    isPaid: remaining <= 0
  };
};
/*===========================================
Calculate Worker Balance
============================================*/

const calculateWorkerBalance = async (cycleId) => {
  const cycle = await getAccountCycleById(cycleId);
  const worker = await getWorkerById(cycle.entityId);
  const totalProduction = worker?.paymentType === 'monthly'
    ? Number(worker.monthlySalary || 0)
    : await getWorkerProductionTotalByCycle(cycleId);
  const totalPayments = await getPaymentsTotalByCycle(
    cycleId,
    'worker',
    'OUT'
);
 
  const remaining = totalProduction - totalPayments;
 

  return {
    totalProduction,
    totalPayments,
    remaining,
    isPaid: remaining <= 0
  };
};


// ============================================
// Calculate Cycle Balance
// ============================================

export const calculateCycleBalance = async (cycleId) => {
  const cycle = await getAccountCycleById(cycleId);

  switch (cycle.accountType) {
    case 'customer':
      return calculateCustomerBalance(cycleId);

    case 'worker':
      return calculateWorkerBalance(cycleId);

    default:
      throw new Error('Unsupported account type.');
  }



  
};



export const startAccountCycle = async (
  accountType,
  entityId
) => {

  const existingCycle = await getOpenAccountCycle(
    accountType,
    entityId
  );

  if (existingCycle) {
    throw new Error('There is already an open cycle.');
  }

  const cycleId = await createAccountCycle({
    accountType,
    entityId,
    status: 'open',
    openedAt: new Date().toISOString()
  });

  return await getAccountCycleById(cycleId);
};