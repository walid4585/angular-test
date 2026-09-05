import {
  createCustomer,
  findCustomerByPhone,
  findCustomersByName,
  findCustomerById,
  updateCustomer,
  archiveCustomer as archiveCustomerRepository,
  getAllCustomers,
  findCustomerByPhoneIncludingArchived,
  restoreCustomer,
} from '../module/customerRepository.js';
import { withDbWriteLock } from '../module/database.js';

const GENERAL_CUSTOMER = {
  name: 'General Customer',
  phone: 'GENERAL',
  address: 'N/A',
};

export const getOrCreateGeneralCustomer = async () => {
  return await withDbWriteLock(async () => {
    const existing = await findCustomerByPhoneIncludingArchived(GENERAL_CUSTOMER.phone);

    if (existing) {
      if (existing.isArchived) {
        await restoreCustomer(existing.id);
      }
      return await findCustomerById(existing.id);
    }

    const result = await createCustomer({
      ...GENERAL_CUSTOMER,
      notes: 'System customer for walk-in orders',
    });

    return await findCustomerById(result.lastID);
  });
};

// ============================================
// Refresh Customer Account
// ============================================

export const refreshCustomerAccount = async (
  entityType,
  entityId
) => {

  if (entityType !== 'customer') {
    console.log('is not customer');
    return;
  }

  const openCycles = await getOpenAccountCyclesByEntity(
    entityType,
    entityId
  );

  const hasAccount = openCycles.length > 0 ? 1 : 0;

  await updateCustomerHasAccount(
    entityId,
    hasAccount
  );

};

// ============================================
// ✅ Customer Status Constants
// ============================================
export const CUSTOMER_STATUS = {
    FOUND_BY_PHONE: 'FOUND_BY_PHONE',
    FOUND_BY_NAME: 'FOUND_BY_NAME',
    NEW_CUSTOMER: 'NEW_CUSTOMER',
};
// ============================================
// ✅ Check Customer
// ============================================
export const checkCustomer = async ({ name, phone }) => {

    if (!name || !phone) {
        throw new Error('Customer name and phone are required.');
    }
    name = name.trim();
    phone = phone.trim();
    const customer = await findCustomerByPhone(phone);

    if (customer) {
        return {
            status: CUSTOMER_STATUS.FOUND_BY_PHONE,
            customer,
        };
    }

    const customers = await findCustomersByName(name);

    if (customers.length > 0) {
        return {
            status: CUSTOMER_STATUS.FOUND_BY_NAME,
            customers,
        };
    }

    return {
        status: CUSTOMER_STATUS.NEW_CUSTOMER,
    };
};
// ============================================
// ✅ Register Customer
// ============================================ 
export const registerCustomer = async (customerData) => {

    const result = await createCustomer(customerData);

    return await findCustomerById(result.lastID);

};

// ============================================
// ✅ Update Customer
// ============================================
export const updateCustomerInfo = async (id, customerData) => {

    return await updateCustomer(id, customerData);

};
// ============================================
// ✅ Archive Customer
// ============================================
export const archiveCustomer = async (id) => {

    return await archiveCustomerRepository(id);
};
// ============================================
// ✅ Get Customer By ID
// ============================================

export const getCustomer = async (id) => {

    return await findCustomerById(id);

};
// ============================================
// ✅ Get All Customers
// ============================================
export const getCustomers = async () => {

    return await getAllCustomers();

};
