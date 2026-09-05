import { withDbWriteLock } from '../module/database.js';
import * as workerProductionService
from '../services/workerProduction.service.js';

// ============================================
// ✅ Add Production
// ============================================

export const addProduction = async (req, res) => {
    console.log('req body', req.body);

    try {

        const {

            workerId,

            cycleId,

            workTypeId,

            quantity,

            productionDate,

            notes

        } = req.body;

        if (!workerId) {

            return res.status(400).json({

                message: 'workerId is required'

            });

        }

        if (!workTypeId) {

            return res.status(400).json({

                message: 'workTypeId is required'

            });

        }

        if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {

            return res.status(400).json({

                message: 'Quantity must be greater than zero'

            });

        }

        if (!productionDate) {

            return res.status(400).json({

                message: 'productionDate is required'

            });

        }

        await withDbWriteLock(async () => {

            const result = await workerProductionService.addProduction({

                workerId,

                cycleId,

                workTypeId,

                quantity,

                productionDate,

                notes

            });

            res.status(201).json({

                message: 'Production added successfully',

                id: result.lastID

            });

        });

    }

    catch (error) {

        console.error('Failed to add production:', error);

        res.status(500).json({

            message: 'Failed to add production'

        });

    }

};

// ============================================
// ✅ Get Worker Production
// ============================================

export const getWorkerProduction = async (req, res) => {

    try {

        const { workerId } = req.params;

        const rows = await workerProductionService.getWorkerProduction(
            workerId
        );

        res.json(rows);

    }

    catch (error) {

        console.error('Failed to load production:', error);

        res.status(500).json({

            message: 'Failed to load production'

        });

    }

};   


// ============================================
// ✅ Delete Production
// ============================================

export const deleteProduction = async (req, res) => {

    try {

        await workerProductionService.deleteProduction(
            req.params.id
        );

        res.json({

            message: 'Production deleted successfully'

        });

    }

   catch (error) {

    console.error('DELETE ERROR:', error);

    res.status(500).json({

        message: error.message

    });

}

};

// ============================================
// ✅ Update Production
// ============================================

export const updateProduction = async (req,  res ) => {

    const { id } = req.params;

    const production = req.body;

    try {

        await workerProductionService.updateProduction(id, production);

        res.json({

            message: 'Production updated successfully'

        });

    }

    catch (error) {

        console.error('Failed to update production:', error);

        res.status(500).json({

            message: 'Failed to update production'

        });

    }

};
