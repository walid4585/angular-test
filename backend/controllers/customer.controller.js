import {
  checkCustomer,
  registerCustomer,
  updateCustomerInfo,
  archiveCustomer,
  getCustomer,
  getCustomers,
  getOrCreateGeneralCustomer,
} from '../services/customer.service.js';
import { getCustomerDetails, getCustomerCyclesHistory } from '../services/customerDetails.service.js';

export const getGeneralCustomerController = async (req, res) => {
  try {
    const customer = await getOrCreateGeneralCustomer();
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error('Get General Customer Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


// ============================================
// Get Customer Cycles History
// ============================================

export const getCustomerCyclesHistoryController = async (req, res) => {

  try {

    const customerId = Number(req.params.id);

    const data = await getCustomerCyclesHistory(customerId);

    return res.status(200).json({

      success: true,

      data,

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
// Get Customer Details
// ============================================

export const getCustomerDetailsController = async (req, res) => {

  try {

    const customerId = Number(req.params.id);

    const data = await getCustomerDetails(customerId);

    return res.status(200).json({

      success: true,

      data,

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
// ✅ Check Customer
// ============================================
export const checkCustomerController = async (req, res) => {
  try {

    const result = await checkCustomer(req.body);

    return res.status(200).json(result);

  } catch (error) {

    console.error('Check Customer Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// ✅ Register Customer
// ============================================
export const registerCustomerController = async (req, res) => {
  try {

    const result = await registerCustomer(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error('Register Customer Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// ✅ Get All Customers
// ============================================
export const getCustomersController = async (req, res) => {
  try {

    const customers = await getCustomers();

    return res.status(200).json({
      success: true,
      data: customers,
    });

  } catch (error) {

    console.error('Get Customers Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// ✅ Get Customer By ID
// ============================================
export const getCustomerController = async (req, res) => {
  try {

    const customer = await getCustomer(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });

  } catch (error) {

    console.error('Get Customer Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// ✅ Update Customer
// ============================================
export const updateCustomerController = async (req, res) => {
  try {

    const result = await updateCustomerInfo(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error('Update Customer Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ============================================
// ✅ Archive Customer
// ============================================
export const archiveCustomerController = async (req, res) => {
  try {

    const result = await archiveCustomer(req.params.id);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.error('Archive Customer Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
