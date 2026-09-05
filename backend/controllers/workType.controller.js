import * as service from '../services/workTypes.service.js';

// ============================================
// ✅ Get Work Types
// ============================================

export const getWorkTypes = async (req, res) => {

    try {

        const workTypes = await service.getWorkTypes();

        res.json(workTypes);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: 'Failed to load work types.'

        });

    }

};

// ============================================
// ✅ Get Work Type By Id
// ============================================

export const getWorkTypeById = async (req, res) => {

    try {

        const id = Number(req.params.id);

        const workType = await service.getWorkTypeById(id);

        if (!workType) {

            return res.status(404).json({

                message: 'Work type not found.'

            });

        }

        res.json(workType);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: 'Failed to load work type.'

        });

    }

};

// ============================================
// ✅ Create Work Type
// ============================================

export const createWorkType = async (req, res) => {

    try {

        const {

            name,

            piecePrice

        } = req.body;

        const result = await service.createWorkType(

            name,

            piecePrice

        );

        res.status(201).json({

            id: result.lastID,

            message: 'Work type created.'

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: 'Failed to create work type.'

        });

    }

};

// ============================================
// ✅ Update Work Type
// ============================================

export const updateWorkType = async (req, res) => {

    try {

        const id = Number(req.params.id);

        const {

            name,

            piecePrice,

            active

        } = req.body;

        await service.updateWorkType(

            id,

            name,

            piecePrice,

            active

        );

        res.json({

            message: 'Work type updated.'

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: 'Failed to update work type.'

        });

    }

};

// ============================================
// ✅ Archive Work Type
// ============================================

export const archiveWorkType = async (req, res) => {

    try {

        const id = Number(req.params.id);

        await service.deleteWorkType(id);

        res.json({

            message: 'Work type deleted.'

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: 'Failed to delete work type.'

        });

    }

};