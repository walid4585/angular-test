import { runAsync, allAsync, getAsync } from './database.js';


// ============================================
// Get Worker Production Total By Cycle
// ============================================

export const getWorkerProductionTotalByCycle = async (cycleId) => {

  const result = await getAsync(

    `
      SELECT
        COALESCE(
          SUM(
            wp.quantity * wt.piecePrice
          ),
          0
        ) AS total
      FROM worker_production wp
      INNER JOIN work_types wt
        ON wp.workTypeId = wt.id
      WHERE wp.cycleId = ?
    `,

    [
      cycleId
    ]

  );
  
console.log(result);
  return result.total;

};

// ============================================
// ✅ Create New Worker
// ============================================
export const createWorker = async (worker) => {
  const sql = `
    INSERT INTO workers (
      name,
      phone,
      address,
      job,
      paymentType,
      monthlySalary
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return await runAsync(sql, [
    worker.name,
    worker.phone,
    worker.address,
    worker.job,
    worker.paymentType,
    worker.monthlySalary
  ]);
};
// ============================================
// ✅ Get All Active Workers
// ============================================
export const getWorkers = async () => {
  return await allAsync(`
    SELECT *
    FROM workers
    WHERE active = 1
    ORDER BY name
  `);
};

// ============================================
// ✅ Get Worker By ID
// ============================================
export const getWorkerById = async (id) => {
  

  return await getAsync(
    `
      SELECT *
      FROM workers
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

};
