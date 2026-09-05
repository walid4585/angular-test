// ============================================
// Imports
// ============================================

import {

  runAsync,
  getAsync,
  allAsync

} from './database.js';


// ============================================
// Create Account Cycle
// ============================================

export const createAccountCycle = async (cycle) => {

  const result = await runAsync(

    `
      INSERT INTO account_cycles (

        accountType,
        entityId,
        status,
        openedAt

      )
      VALUES (?, ?, ?, ?)
    `,

    [

      cycle.accountType,
      cycle.entityId,
      cycle.status,
      cycle.openedAt

    ]

  );

  return result.lastID;

};

// ============================================
// Get Open Account Cycle
// ============================================

export const getOpenAccountCycle = async (

  accountType,
  entityId

) => {

  return await getAsync(

    `
      SELECT *

      FROM account_cycles

      WHERE accountType = ?

      AND entityId = ?

      AND status = 'open'

      LIMIT 1
    `,

    [

      accountType,
      entityId

    ]

  );

};
// ============================================
// Reopen Account Cycle
// ============================================

export const reopenAccountCycle = async (id) => {

  await runAsync(

    `
    UPDATE account_cycles

    SET

      status = 'open',

      closedAt = NULL,

      updatedAt = CURRENT_TIMESTAMP

    WHERE id = ?

    `,

    [id]

  );

};

// ============================================
// Get Account Cycle By Id
// ============================================

export const getAccountCycleById = async (id) => {

  return await getAsync(

    `
      SELECT *

      FROM account_cycles

      WHERE id = ?
    `,

    [

      id

    ]

  );

};
// ============================================
// Close Account Cycle
// ============================================

export const closeAccountCycle = async (

  id,
  closedAt

) => {

  await runAsync(

    `
      UPDATE account_cycles

      SET

        status = 'closed',

        closedAt = ?,

        updatedAt = CURRENT_TIMESTAMP

      WHERE id = ?

    `,

    [

      closedAt,
      id

    ]

  );

};
// ============================================
// Get Account Cycles
// ============================================

export const getAccountCycles = async (

  accountType,
  entityId

) => {

  return await allAsync(

    `
      SELECT *

      FROM account_cycles

      WHERE accountType = ?

      AND entityId = ?

      ORDER BY openedAt DESC

    `,

    [

      accountType,
      entityId

    ]

  );

};

// ============================================
// Get Open Account Cycles By Entity
// ============================================

export const getOpenAccountCyclesByEntity = async (
  entityType,
  entityId
) => {

  return await allAsync(
    `
      SELECT id
      FROM account_cycles
      WHERE entityType = ?
      AND entityId = ?
      AND status = 'open'
    `,
    [
      entityType,
      entityId
    ]
  );

};