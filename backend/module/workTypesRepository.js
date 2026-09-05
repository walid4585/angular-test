import {

    allAsync,

    getAsync,

    runAsync

} from './database.js';

// ============================================
// ✅ Get Work Types
// ============================================

export const getWorkTypes = async () => {

    return await allAsync(

        `
        SELECT *

        FROM work_types

        ORDER BY name
        `

    );

};

// ============================================
// ✅ Get Work Type By Id
// ============================================

export const getWorkTypeById = async (id) => {

    return await getAsync(

        `
        SELECT *

        FROM work_types

        WHERE id = ?
        `,

        [

            id

        ]

    );

};

// ============================================
// ✅ Create Work Type
// ============================================

export const createWorkType = async (

    name,

    piecePrice

) => {

    return await runAsync(

        `
        INSERT INTO work_types
        (

            name,

            piecePrice

        )

        VALUES
        (

            ?,

            ?

        )
        `,

        [

            name,

            piecePrice

        ]

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

    return await runAsync(

        `
        UPDATE work_types

        SET

            name = ?,

            piecePrice = ?,

            active = ?

        WHERE id = ?
        `,

        [

            name,

            piecePrice,

            active,

            id

        ]

    );

};

// ============================================
// ✅ Archive Work Type
// ============================================

export const archiveWorkType = async (id) => {

    return await runAsync(

        `
        UPDATE work_types

        SET

            active = 0

        WHERE id = ?
        `,

        [

            id

        ]

    );

};