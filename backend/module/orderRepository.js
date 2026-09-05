import {
  runAsync,
  getAsync,
  allAsync,
} from './database.js';


// ============================================
// Get Orders By Cycle
// ============================================

export const getOrdersByCycle = async (cycleId) => {

  return await allAsync(

    `
      SELECT *

      FROM orders

      WHERE cycleId = ?

      ORDER BY id DESC
    `,

    [

      cycleId

    ]

  );

};

// ============================================
// Get Orders Total By Cycle
// ============================================

export const getOrdersTotalByCycle = async (

  cycleId

) => {

  const result = await getAsync(

    `
      SELECT

        COALESCE(

          SUM(totalPrice),

          0

        ) AS total

      FROM orders

      WHERE cycleId = ?

    `,

    [

      cycleId

    ]

  );

  return result.total;

};

// ============================================
// ✅ Create Order
// ============================================

export const createOrder = async (orderData) => {

    const {
        customerId,
        cycleId,
        customerName,
        phone,
        address,
        product,
        size,
        price,
        quantity,
        totalPrice,
        status,
        date,
        productId,
    } = orderData;

    const sql = `
        INSERT INTO orders (
            customerId,
            cycleId,
            customerName,
            phone,
            address,
            product,
            size,
            price,
            quantity,
            totalPrice,
            status,
            date,
            productId
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        customerId,
        cycleId,
        customerName,
        phone,
        address,
        product,
        size,
        price,
        quantity,
        totalPrice,
        status,
        date,
        productId,
    ];

    return await runAsync(sql, params);

};

// ============================================
// ✅ Get All Orders
// ============================================

export const getAllOrders = async () => {
  return await allAsync(`
    SELECT
      id,
      customerId,
      cycleId,
      customerName,
      phone,
      address,
      product,
      size,
      price,
      quantity,
      totalPrice,
      status,
      date,
      productId
    FROM orders
  `);
};

// ============================================
// ✅ Get Order By ID
// ============================================

export const getOrderById = async (id) => {

  return await getAsync(
    `
      SELECT *
      FROM orders
      WHERE id = ?
    `,
    [id]
  );

};
// ============================================
// ✅ Update Order
// ============================================

export const updateOrder = async (
  id,
  orderData
) => {

  const {
    customerName,
    phone,
    address,
    product,
    size,
    price,
    quantity,
    totalPrice,
    status,
    date,
    productId,
  } = orderData;

  return await runAsync(
    `
      UPDATE orders
      SET
        customerName = ?,
        phone = ?,
        address = ?,
        product = ?,
        size = ?,
        price = ?,
        quantity = ?,
        totalPrice = ?,
        status = ?,
        date = ?,
        productId = ?
      WHERE id = ?
    `,
    [
      customerName,
      phone,
      address,
      product,
      size,
      price,
      quantity,
      totalPrice,
      status,
      date,
      productId,
      id,
    ]
  );

};

// ============================================
// ✅ Delete Order
// ============================================

export const deleteOrder = async (id) => {

  return await runAsync(
    `
      DELETE FROM orders
      WHERE id = ?
    `,
    [id]
  );

};
// ============================================
// ✅ Update Product Stock
// ============================================

export const updateProductStock = async (
  productId,
  newStock
) => {

  return await runAsync(
    `
      UPDATE products
      SET stock = ?
      WHERE id = ?
    `,
    [newStock, productId]
  );

};

//========================================
// ✅ Get Filtered Orders
//========================================
export const getFilteredOrders = async (filters) => {

  let sql = `
    SELECT
      id,
      customerId,
      customerName,
      phone,
      address,
      product,
      size,
      price,
      quantity,
      totalPrice,
      status,
      date,
      productId
    FROM orders
  `;

  const conditions = [];

  const params = [];

const {
  customerId,
  search,
  status,
  from,
  to,
} = filters;

if (customerId) {

  conditions.push(`
    customerId = ?
  `);

  params.push(customerId);

}

if (search) {

  conditions.push(`
    (
      customerName LIKE ?
      OR phone LIKE ?
      OR product LIKE ?
    )
  `);

  const keyword = `%${search}%`;

  params.push(
    keyword,
    keyword,
    keyword
  );

}
if (status) {

  conditions.push(`
    status = ?
  `);

  params.push(status);

}

if (from) {

  conditions.push(`
    date >= ?
  `);

  params.push(from);

}

if (to) {

  conditions.push(`
    date <= ?
  `);

  params.push(to);

}

if (conditions.length > 0) {

  sql += `
    WHERE
    ${conditions.join(' AND ')}
  `;

}


sql += `
  ORDER BY id DESC
`;

return await allAsync(
  sql,
  params
);
};