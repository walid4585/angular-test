import * as repository from '../module/workTypesRepository.js';

// ============================================
// ✅ Get Work Types
// ============================================

export const getWorkTypes = async () => {

    return await repository.getWorkTypes();

};

// ============================================
// ✅ Get Work Type By Id
// ============================================

export const getWorkTypeById = async (id) => {

    return await repository.getWorkTypeById(id);

};

// ============================================
// ✅ Create Work Type
// ============================================

export const createWorkType = async (

    name,

    piecePrice

) => {

    return await repository.createWorkType(

        name,

        piecePrice

    );

};

// ============================================
// ✅ Update Work Type
// ============================================

export const updateWorkType = async (

    id,

    name,

    piecePrice,

    active

) => {

    return await repository.updateWorkType(

        id,

        name,

        piecePrice,

        active

    );

};

// ============================================
// ✅ Archive Work Type
// ============================================

export const archiveWorkType = async (id) => {

    return await repository.deleteWorkType(id);

};