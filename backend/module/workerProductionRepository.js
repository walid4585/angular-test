import {

    runAsync,

    allAsync

}
from '../module/database.js';

// ============================================
// ✅ Add Production
// ============================================

export const addProduction = async (production) => {

    return await runAsync(

        `
        INSERT INTO worker_production (

            workerId,

            cycleId,

            workTypeId,

            quantity,

            productionDate,

            notes

        )

        VALUES (?, ?, ?, ?, ?, ?)
        `,

        [

            production.workerId,

            production.cycleId,

            production.workTypeId,

            production.quantity,

            production.productionDate,

            production.notes

        ]

    );

};
// ============================================
// ✅ Get Worker Production
// ============================================

export const getWorkerProduction = async (workerId) => {

    return await allAsync(

        `
        SELECT

    wp.id,

    wp.quantity,

    wt.piecePrice AS price,

    (wt.piecePrice * wp.quantity) AS total,

    wp.productionDate,

    wp.notes,

    wt.id AS workTypeId,

    wt.name AS workTypeName

FROM worker_production wp

INNER JOIN work_types wt

    ON wt.id = wp.workTypeId

WHERE wp.workerId = ?

ORDER BY wp.productionDate DESC
        `,

        [

            workerId

        ]

    );

};

// ============================================
// ✅ Delete Production
// ============================================

export const deleteProduction = async (id) => {

    return await runAsync(

        `
        DELETE FROM worker_production
        WHERE id = ?
        `,

        [

            id

        ]

    );

};

// ============================================
// ✅ Update Production
// ============================================

export const updateProduction = async (id, production) => {

    return await runAsync(

        `
        UPDATE worker_production
        SET

            workTypeId = ?,
            quantity = ?,
            productionDate = ?,
            notes = ?

        WHERE id = ?
        `,

        [

            production.workTypeId,
            production.quantity,
            production.productionDate,
            production.notes,
            id

        ]

    );

};
// ============================================
// ✅ Get Production By Cycle
// ============================================

export const getWorkerProductionByCycle = async (cycleId) => {

    return await allAsync(

        `
        SELECT

            wp.id,

            wp.workerId,

            wp.quantity,

            wt.id AS workTypeId,

            wt.name AS workTypeName,

            wt.piecePrice AS price,

            (wt.piecePrice * wp.quantity) AS total,

            wp.productionDate,

            wp.notes

        FROM worker_production wp

        INNER JOIN work_types wt

            ON wt.id = wp.workTypeId

        WHERE wp.cycleId = ?

        ORDER BY wp.productionDate DESC
        `,

        [

            cycleId

        ]

    );

};