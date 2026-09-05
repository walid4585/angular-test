import * as workersRepository from '../module/workersRepository.js';

// ============================================
// ✅ Create Worker
// ============================================
export const createWorker = async (worker) => {

  return await workersRepository.createWorker(worker);

};

// ============================================
// ✅ Get All Workers
// ============================================
export const getWorkers = async () => {

  return await workersRepository.getWorkers();

};
// ============================================
// ✅ Get Worker Details
// ============================================
export const getWorkerByIdService = async (id) => {

  const worker = await workersRepository.getWorkerById(id);

  if (!worker) {

    throw new Error('Worker not found.');

  }

  return worker;

};
