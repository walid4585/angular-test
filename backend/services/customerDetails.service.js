// ============================================
// Imports
// ============================================
import { getOrdersByCycle } from '../module/orderRepository.js';

import { findCustomerById } from '../module/customerRepository.js';

import { getOpenAccountCycle } from '../module/accountCyclesRepository.js';

import { getPaymentsByCycle } from '../module/transactionsRepository.js';

import { calculateCycleBalance } from './accountCycles.service.js';

import { getAccountCycles } from '../module/accountCyclesRepository.js';

// ============================================
// Get Customer Details
// ============================================

export const getCustomerDetails = async (customerId) => {

    const customer = await findCustomerById(customerId);

    if (!customer) {

        throw new Error('Customer not found');

    }

    const currentCycle = await getOpenAccountCycle(

        'customer',

        customerId

    );

   let orders = [];

   let payments = [];

   let balance = null;

if (currentCycle) {

    orders = await getOrdersByCycle(

        currentCycle.id


    );
    payments = await getPaymentsByCycle(
        currentCycle.id,
        'customer',
        'IN'
    );
    balance = await calculateCycleBalance(
        currentCycle.id
    );
}

return {

    customer,

    currentCycle,

    orders,

    payments,
    
    balance

};

};



// ============================================
// Get Customer Cycles History
// ============================================

export const getCustomerCyclesHistory = async (customerId) => {

    const cycles = await getAccountCycles(
        'customer',
        customerId
    );

    for (const cycle of cycles) {

         cycle.orders = await getOrdersByCycle(
        cycle.id
    );

    cycle.payments = await getPaymentsByCycle(
        cycle.id,
        'customer',
        'IN'
    );

    cycle.balance = await calculateCycleBalance(
        cycle.id
    );

    }

    return cycles;

};

