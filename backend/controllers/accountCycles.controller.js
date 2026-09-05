import {
  startAccountCycle
} from '../services/accountCycles.service.js';

export const startAccountCycleController = async (req, res) => {

  try {

    const { accountType, entityId } = req.body;

    if (!accountType || !entityId) {

      return res.status(400).json({
        message: 'accountType and entityId are required.'
      });

    }

    const cycle = await startAccountCycle(
      accountType,
      Number(entityId)
    );

    return res.status(201).json({
      cycle
    });

  } catch (error) {

    console.error('Start account cycle error:', error);

    return res.status(error.status || 500).json({
      message: error.message || 'Failed to start account cycle.'
    });

  }

};