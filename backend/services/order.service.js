import {
  createOrder,
  getFilteredOrders,
  updateProductStock,
  getOrderById,
  deleteOrder,
  updateOrder,
  
} from '../module/orderRepository.js';

import {
  execAsync,
  getAsync,
  runAsync,
  withDbWriteLock,
} from '../module/database.js';

// ============================================
// Services
// ============================================

import {

  getOrCreateAccountCycle

} from './accountCycles.service.js';

// ============================================
// ✅ Helpers
// ============================================

const toTrimmedString = (value) => {
  return typeof value === 'string'
    ? value.trim()
    : '';
};

const toPositiveInteger = (value) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
};

// ============================================
// ✅ Update Same Product
// ============================================

const updateSameProduct = async ({
  id,
  oldOrder,
  product,
  productId,
  customerName,
  phone,
  address,
  size,
  quantity,
  unitPrice,
  status,
  date,
}) => {
  const oldQuantity = Number(oldOrder.quantity);

const availableStock =
  Number(product.stock) + oldQuantity;

if (!Number.isInteger(availableStock)) {
  throw new Error(
    `Invalid stock stored for product ${productId}`
  );
}

if (quantity > availableStock) {
  throw new Error(
    'Requested quantity exceeds available stock'
  );
}

const totalPrice = unitPrice * quantity;

const newStock = availableStock - quantity;
const updateResult = await updateProductStock(
  productId,
  newStock
);

if (updateResult.changes === 0) {
  throw new Error(
    'Failed to update product stock'
  );
}
const orderResult = await updateOrder(
  id,
  {
    customerName,
    phone,
    address,
    product: product.title,
    size,
    price: unitPrice,
    quantity,
    totalPrice,
    status,
    date,
    productId,
  }
);

if (orderResult.changes === 0) {
  throw new Error(
    'Failed to update order'
  );
}
return {
  success: true,
  remainingStock: newStock,
  updatedOrderId: id,
  message: 'Order updated successfully',
};

};

// ============================================
// ✅ Update Different Product
// ============================================

const updateDifferentProduct = async ({
  id,
  oldOrder,
  newProduct,
  newProductId,
  customerName,
  phone,
  address,
  size,
  quantity,
  unitPrice,
  status,
  date,
}) => {

  // ============================================
  // Get old product
  // ============================================

  const oldProduct = await getAsync(
    `
      SELECT
        id,
        stock
      FROM products
      WHERE id = ?
    `,
    [oldOrder.productId]
  );

  if (!oldProduct) {
    throw new Error('Old product not found');
  }

  // ============================================
  // Validate stocks
  // ============================================

  const oldProductStock = Number(oldProduct.stock);
  const newProductStock = Number(newProduct.stock);

  const oldQuantity = Number(oldOrder.quantity);

  if (!Number.isInteger(oldProductStock)) {
    throw new Error('Invalid old product stock');
  }

  if (!Number.isInteger(newProductStock)) {
    throw new Error('Invalid new product stock');
  }

  if (quantity > newProductStock) {
    throw new Error(
      'Requested quantity exceeds available stock'
    );
  }

  // ============================================
  // Calculate new stocks
  // ============================================

  const restoredOldStock =
    oldProductStock + oldQuantity;

  const updatedNewStock =
    newProductStock - quantity;

  // ============================================
  // Update old product stock
  // ============================================

  const restoreResult =
    await updateProductStock(
      oldOrder.productId,
      restoredOldStock
    );

  if (restoreResult.changes === 0) {
    throw new Error(
      'Failed to restore old product stock'
    );
  }

  // ============================================
  // Update new product stock
  // ============================================

  const updateNewStockResult =
    await updateProductStock(
      newProductId,
      updatedNewStock
    );

  if (updateNewStockResult.changes === 0) {
    throw new Error(
      'Failed to update new product stock'
    );
  }

  // ============================================
  // Update order
  // ============================================

  const totalPrice =
    unitPrice * quantity;

  const orderResult =
    await updateOrder(
      id,
      {
        customerName,
        phone,
        address,
        product: newProduct.title,
        size,
        price: unitPrice,
        quantity,
        totalPrice,
        status,
        date,
        productId: newProductId,
      }
    );

  if (orderResult.changes === 0) {
    throw new Error(
      'Failed to update order'
    );
  }

  return {
    success: true,
    updatedOrderId: id,
    remainingStock: updatedNewStock,
    message:
      'Order updated successfully',
  };

};

// ============================================
// ✅ Get Orders
// ============================================

export const getOrders = async (filters) => {

  return await getFilteredOrders(filters);

};

// ============================================
// ✅ Add Order
// ============================================

export const addOrder = async (orderData) => {
  const customer = orderData.customerId;
  const customerName = toTrimmedString(orderData.customerName);
  const phone = toTrimmedString(orderData.phone);
  const address = toTrimmedString(orderData.address);
  const size = toTrimmedString(orderData.size);

  const productId = toPositiveInteger(orderData.productId);
  const quantity = toPositiveInteger(orderData.quantity);

  const status = 'pending';
  const date = new Date().toISOString();

  if (!customerName) {
    throw new Error('customerName is required');
  }

  if (!phone) {
    throw new Error('phone is required');
  }

  if (!address) {
    throw new Error('address is required');
  }

  if (productId === null) {
    throw new Error('productId must be a positive integer');
  }

  if (quantity === null) {
    throw new Error('quantity must be a positive integer');
  }

  await withDbWriteLock(async () => {

    await execAsync('BEGIN TRANSACTION');

    try {

      const product = await getAsync(
  `
    SELECT
      id,
      title,
      price,
      stock
    FROM products
    WHERE id = ?
  `,
  [productId]
);

if (!product) {
  throw new Error('Product not found');
}
const availableStock = Number(product.stock);
const productPrice = Number(product.price);
const bodyPrice = Number(orderData.price);

const unitPrice =
  productPrice === bodyPrice && !isNaN(productPrice)
    ? productPrice
    : bodyPrice;

if (!Number.isFinite(unitPrice)) {
  throw new Error(`Invalid price stored for product ${productId}`);
}

if (!Number.isInteger(availableStock)) {
  throw new Error(`Invalid stock stored for product ${productId}`);
}

if (quantity > availableStock) {
  throw new Error('Requested quantity exceeds available stock');
}

const totalPrice = unitPrice * quantity;
const newStock = availableStock - quantity;
const updateResult = await updateProductStock(
  productId,
  newStock
);

if (updateResult.changes === 0) {
  throw new Error(
    `Failed to update stock for product ${productId}`
  );
}
;
// ============================================
// Get Customer Account Cycle
// ============================================

const cycle = await getOrCreateAccountCycle(

  'customer',

  customer

);


const result = await createOrder({
  customerId: customer,
  cycleId: cycle.id,
  customerName,
  phone,
  address,
  product: product.title,
  size,
  price: unitPrice,
  quantity,
  totalPrice,
  status,
  date,
  productId,
});
const savedOrder = await getAsync(
  `
    SELECT
      id,
      customerId,
      cycleId,
      totalPrice
    FROM orders
    WHERE id = ?
  `,
  [result.lastID]
);

console.log('Saved Order:', savedOrder);
await execAsync('COMMIT');

return result;

} catch (error) {

  await execAsync('ROLLBACK').catch(() => undefined);

  throw error;

}

  });

};

// ============================================
// ✅ Delete Order
// ============================================

export const removeOrder = async (id) => {

  return await withDbWriteLock(async () => {

    await execAsync('BEGIN TRANSACTION');

    try {

      const order = await getOrderById(id);

      if (!order) {
        throw new Error('Order not found');
      }

      const product = await getAsync(
        `
          SELECT stock
          FROM products
          WHERE id = ?
        `,
        [order.productId]
      );

      if (!product) {
        throw new Error('Product not found');
      }

      const currentStock = Number(product.stock);
      const orderQuantity = Number(order.quantity);

      const newStock = currentStock + orderQuantity;

      const updateResult = await updateProductStock(
        order.productId,
        newStock
      );

      if (updateResult.changes === 0) {
        throw new Error('Failed to restore product stock');
      }

      const deleteResult = await deleteOrder(id);

      if (deleteResult.changes === 0) {
        throw new Error('Failed to delete order');
      }

      await execAsync('COMMIT');

      return {
        success: true,
        restoredStock: newStock,
        deletedOrderId: id,
        message: 'Order deleted and stock restored successfully',
      };

    } catch (error) {

      await execAsync('ROLLBACK').catch(() => undefined);

      throw error;

    }

  });

};



// ============================================
// ✅ Update Order
// ============================================

export const editOrder = async (
  id,
  orderData
) => {

return  await withDbWriteLock(async () => {

    await execAsync('BEGIN TRANSACTION');

    try {

      const oldOrder = await getOrderById(id);

      if (!oldOrder) {
        throw new Error('Order not found');
      }

      const customerName = toTrimmedString(orderData.customerName);
      const phone = toTrimmedString(orderData.phone);
      const address = toTrimmedString(orderData.address);
      const size = toTrimmedString(orderData.size);

      const productId = toPositiveInteger(orderData.productId);
      const quantity = toPositiveInteger(orderData.quantity);

      const status = orderData.status ?? oldOrder.status;
      const date = oldOrder.date;

      if (!customerName) {
        throw new Error('customerName is required');
      }

      if (!phone) {
        throw new Error('phone is required');
      }

      if (!address) {
        throw new Error('address is required');
      }

      if (productId === null) {
        throw new Error('productId must be a positive integer');
      }

      if (quantity === null) {
        throw new Error('quantity must be a positive integer');
      }

      const product = await getAsync(
        `
          SELECT
            id,
            title,
            price,
            stock
          FROM products
          WHERE id = ?
        `,
        [productId]
      );

      if (!product) {
        throw new Error('Product not found');
      }

      const productPrice = Number(product.price);
      const bodyPrice = Number(orderData.price);

      const unitPrice =
        productPrice === bodyPrice && !isNaN(productPrice)
          ? productPrice
          : bodyPrice;

      if (!Number.isFinite(unitPrice)) {
        throw new Error(
          `Invalid price stored for product ${productId}`
        );
      }

      // ============================================
      // Same Product
      // ============================================

      if (oldOrder.productId === productId) {

        const result = await updateSameProduct({
          id,
          oldOrder,
          product,
          productId,
          customerName,
          phone,
          address,
          size,
          quantity,
          unitPrice,
          status,
          date,
        });
       console.log('Same Product Result:', result);
        await execAsync('COMMIT');

        return result;

      }

// ============================================
// Different Product
// ============================================

const result = await updateDifferentProduct({
  id,
  oldOrder,
  newProduct: product,
  newProductId: productId,
  customerName,
  phone,
  address,
  size,
  quantity,
  unitPrice,
  status,
  date,
});
console.log('Different Product Result:', result);
await execAsync('COMMIT');

return result;

    } catch (error) {

      await execAsync('ROLLBACK').catch(() => undefined);

      throw error;

    }

  });

};