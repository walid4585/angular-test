import * as workersService from '../services/workers.service.js';

import {
    getWorkerDetails,
    getWorkerCyclesHistory
} from '../services/workerDetails.service.js';


// ============================================
// ✅ Create Worker
// ============================================
export const createWorker = async (req, res) => {
  try {

    const result = await workersService.createWorker(req.body);

    res.status(201).json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to create worker.'
    });

  }
};


// ============================================
// ✅ Get All Workers
// ============================================
export const getWorkers = async (req, res) => {
  try {

    const workers = await workersService.getWorkers();

    res.json(workers);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to load workers.'
    });

  }
};
// ============================================
// ✅ Get Worker By ID
// ============================================
export const getWorkerById = async (req, res) => {

  try {

    const worker =
      await workersService.getWorkerByIdService(
        req.params.id
      );

    res.json(worker);

  } catch (error) {

    console.error(error);

    res.status(404).json({

      message: error.message

    });

  }

};
// ============================================
// Get Worker Details
// ============================================

export const getWorkerDetailsController = async (req, res) => {

    try {

        const workerId = Number(req.params.id);

        const result = await getWorkerDetails(workerId);

        res.status(200).json(result);

    } catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};

// ============================================
// Get Worker Cycles History
// ============================================

export const getWorkerCyclesHistoryController = async (req, res) => {

    try {

        const workerId = Number(req.params.id);

        const cycles = await getWorkerCyclesHistory(workerId);

        res.status(200).json(cycles);

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};