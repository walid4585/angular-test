import * as workerProductionRepository
from '../module/workerProductionRepository.js';
import { getOrCreateAccountCycle } from './accountCycles.service.js';


// ============================================
// ✅ Add Production
// ============================================

export const addProduction = async (production) => {
     console.log('BEFORE cycle:', production);
    
    const cycle = await getOrCreateAccountCycle(
        'worker',
        production.workerId
    );
    console.log('ACCOUNT CYCLE:', cycle);
    if (!cycle) {
        console.error('No account cycle found for workerId:', production.workerId);
        throw {
            status: 404,
            message: 'Account cycle not found.'
        };
    }


    production.cycleId = cycle.id;

    return await workerProductionRepository.addProduction(
        production
    );

};

// ============================================
// ✅ Get Worker Production
// ============================================

export const getWorkerProduction = async (workerId) => {

    return await workerProductionRepository.getWorkerProduction(

        workerId

    );

};

// ============================================
// ✅ Delete Production
// ============================================

export const deleteProduction = async (id) => {

    return await workerProductionRepository.deleteProduction(

        id

    );
};
// ============================================
// ✅ Update Production
// ============================================

export const updateProduction = async (id, production) => {

    return await workerProductionRepository.updateProduction(

        id,
        production
    );

};