import {
  addOrder,
  getOrders,
  removeOrder,
  editOrder
} from '../services/order.service.js';

// ============================================
// ✅ Get Orders
// ============================================

export const getOrdersController = async (req, res) => {

  try {

    const orders = await getOrders({
      
      customerId: req.query.customerId,

      search: req.query.search,

      status: req.query.status,

      from: req.query.from,

      to: req.query.to,

    });

    return res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ============================================
// ✅ Add Order
// ============================================

export const addOrderController = async (req, res) => {

  try {

    const order = await addOrder(req.body);

    return res.status(201).json({
      success: true,
      data: order,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// ============================================
// ✅ Delete Order
// ============================================

export const removeOrderController = async (req, res) => {

  try {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const result = await removeOrder(id);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
//============================================
// ✅ Update order
//============================================
export const editOrderController = async (req, res) => {
  try{const id = Number(req.params.id);
  const result = await editOrder(
  id,
  req.body
);
console.log(result);
res.status(200).json({
  success: true,
  data: result,
});}catch(error){
  res.status(500).json({
  success: false,
  message: error.message,
});
}
  

};