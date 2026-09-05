import { getAsync, runAsync, allAsync} from './database.js';



// ============================================
// ✅ Find Customer By Name
// ============================================

export const findCustomersByName = async (name) => {

  const sql = `
    SELECT *
    FROM customers
    WHERE name LIKE ?
      AND isArchived = 0
    ORDER BY name
  `;

  return await allAsync(sql, [`%${name}%`]);

};

// ============================================
// ✅ Find Customer By Phone
// ============================================
export const findCustomerByPhone = async (phone) => {

  const sql = `
    SELECT *
    FROM customers
    WHERE phone = ?
      AND isArchived = 0
    LIMIT 1
  `;

  return await getAsync(sql, [phone]);

};

// ============================================
// ✅ Create Customer
// ============================================
export const createCustomer = async (customer) => {

  const {
    name,
    phone,
    address,
    notes,
  } = customer;

  const sql = `
    INSERT INTO customers (
      name,
      phone,
      address,
      notes
    )
    VALUES (?, ?, ?, ?)
  `;

  return await runAsync(sql, [
    name,
    phone,
    address,
    notes,
  ]);

};
// ============================================
// ✅ Find Customer By ID
// ============================================

export const findCustomerById = async (id) => {

  const sql = `
    SELECT
      c.*,
      CASE WHEN EXISTS (
        SELECT 1
        FROM account_cycles ac
        WHERE ac.accountType = 'customer'
          AND ac.entityId = c.id
          AND ac.status = 'open'
      ) THEN 1 ELSE 0 END AS hasOpenCycle
    FROM customers c
    WHERE c.id = ?
    LIMIT 1
  `;

  return await getAsync(sql, [id]);

};
// ============================================
// ✅ Update Customer
// ============================================
export const updateCustomer = async (id, customer) => {

  const {
    name,
    phone,
    address,
    notes,
  } = customer;

  const sql = `
    UPDATE customers
    SET
      name = ?,
      phone = ?,
      address = ?,
      notes = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  return await runAsync(sql, [
    name,
    phone,
    address,
    notes,
    id,
  ]);

};
// ============================================
// ✅ Archive Customer
// ============================================
export const archiveCustomer = async (id) => {

  const sql = `
    UPDATE customers
    SET
      isArchived = 1,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  return await runAsync(sql, [id]);

};
// ============================================
// ✅ Get All Customers
// ============================================
export const getAllCustomers = async () => {

  const sql = `
    SELECT
    c.id,
    c.name,
    c.phone,
    c.address,
    c.category,
    c.hasAccount,
    CASE WHEN EXISTS (
      SELECT 1
      FROM account_cycles ac
      WHERE ac.accountType = 'customer'
        AND ac.entityId = c.id
        AND ac.status = 'open'
    ) THEN 1 ELSE 0 END AS hasOpenCycle,
    c.createdAt,
    c.updatedAt,
    COUNT(o.id) AS ordersCount
FROM customers c
LEFT JOIN orders o
ON o.customerId = c.id
WHERE c.isArchived = 0
GROUP BY c.id
ORDER BY c.createdAt DESC;
  `;

  return await allAsync(sql);

};

// ============================================
// Update Customer Account Status
// ============================================

export const updateCustomerHasAccount = async (
  customerId,
  hasAccount
) => {

  return await runAsync(
    `
      UPDATE customers
      SET hasAccount = ?
      WHERE id = ?
    `,
    [
      hasAccount,
      customerId
    ]
  );

};

export const restoreCustomer = async (id) => {
  return await runAsync(
    `UPDATE customers SET isArchived = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    [id]
  );
};

// Used for the system-owned walk-in customer. Unlike the normal lookup,
// this also finds an archived record so it can be reused instead of creating
// a duplicate phone number.
export const findCustomerByPhoneIncludingArchived = async (phone) => {
  return await getAsync(
    `SELECT * FROM customers WHERE phone = ? LIMIT 1`,
    [phone]
  );
};
