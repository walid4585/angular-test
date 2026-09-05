import {
  runAsync,
  getAsync,
  allAsync,
} from './database.js';

// ============================================
// Get Payments By Cycle
// ============================================

export const getPaymentsByCycle = async (
  cycleId,
  entityType,
  direction
) => {

  return await allAsync(
    `
      SELECT *
      FROM transactions
      WHERE cycleId = ?
      AND direction = ?
      AND entityType = ?
      ORDER BY id DESC
    `,
    [
      cycleId,
      direction,
      entityType
    ]
  );

};

// ============================================
// Get Payments Total By Cycle
// ============================================

export const getPaymentsTotalByCycle = async (
    cycleId,
    entityType,
    direction
) => {

    const result = await getAsync(
        `
        SELECT
            COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE cycleId = ?
          AND entityType = ?
          AND direction = ?
        `,
        [
            cycleId,
            entityType,
            direction
        ]
    );

    return result.total;
};



/*=============================================
= Create Transaction
=============================================*/

export const createTransaction = async (transaction) => {
  const {
    type,
    direction,
    amount,
    entityType,
    entityId,
    cycleId,
    orderId,
    note,
    transactionDate,
    status,
  } = transaction;
  const sql = `
    INSERT INTO transactions (
      type,
      direction,
      amount,
      entityType,
      entityId,
      cycleId,
      orderId,
      note,
      transactionDate,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
  type,
  direction,
  amount,
  entityType,
  entityId,
  cycleId,
  orderId,
  note,
  transactionDate,
  status,
];
const result = await runAsync(sql, params);

  return result;
};



export const getTransactionById = async (id) => {
  const sql = `
  SELECT *
  FROM transactions
  WHERE id = ?
`;
const params = [id];
const transaction = await getAsync(sql, params);
return transaction;
};

export const searchTransactions = async (filters) => {
    let sql = `
SELECT *
FROM transactions
WHERE 1=1
`; 
const params = [];
const {
    type,
    direction,
    entityType,
    entityId,
    orderId,
    status,
    fromDate,
    toDate,
  } = filters;
if (type) {
  sql += ` AND type = ?`;
  params.push(type);
}
if (direction) {
  sql += ` AND direction = ?`;
  params.push(direction);
}

if (entityType) {
  sql += ` AND entityType = ?`;
  params.push(entityType);
}

if (entityId) {
  sql += ` AND entityId = ?`;
  params.push(entityId);
}

if (orderId) {
  sql += ` AND orderId = ?`;
  params.push(orderId);
}

if (status) {
  sql += ` AND status = ?`;
  params.push(status);
}
if (fromDate) {
    sql += ` AND transactionDate >= ?`;
    params.push(fromDate);
}
if (toDate) {
    sql += ` AND transactionDate <= ?`;
    params.push(toDate);
}
sql += ` ORDER BY transactionDate DESC, id DESC`;
const transactions = await allAsync(sql, params);

return transactions;

};

export const updateTransaction = async (id, data) => {
  const {
    type,
    direction,
    amount,
    entityType,
    entityId,
    orderId,
    note,
    transactionDate,
    status,
  } = data;

  const sql = `
    UPDATE transactions
    SET
      type = ?,
      direction = ?,
      amount = ?,
      entityType = ?,
      entityId = ?,
      orderId = ?,
      note = ?,
      transactionDate = ?,
      status = ?
    WHERE id = ?
  `;

  const params = [
    type,
    direction,
    amount,
    entityType,
    entityId,
    orderId,
    note,
    transactionDate,
    status,
    id,
  ];

  await runAsync(sql, params);

return await getTransactionById(id);
};

export const deleteTransaction = async (id) => {
    const sql = `DELETE FROM transactions
                   WHERE id = ?`;
    const params = [id] ;
    
    const result = await runAsync(sql,params);
    
    return result;

};
