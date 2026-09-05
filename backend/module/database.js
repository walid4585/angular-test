import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '..', 'orders.db');

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

// ====== Database Helpers ======
const execAsync = (sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });

// ====== Write Lock ======
let writeQueue = Promise.resolve();

export const withDbWriteLock = async (task) => {
  const previous = writeQueue;
  let release;

  writeQueue = new Promise((resolve) => {
    release = resolve;
  });

  await previous.catch(() => undefined);

  try {
    return await task();
  } finally {
    release();
  }
};

// ====== Helpers ======
const normalizeType = (type) => String(type ?? '').trim().toUpperCase();


// ====== Schemas ======


const WORKERS_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    phone TEXT,

    address TEXT,

    job TEXT,
    
    

    paymentType TEXT NOT NULL
        CHECK(paymentType IN ('monthly', 'piece','tailor')),

    monthlySalary REAL DEFAULT 0,

    active INTEGER DEFAULT 1,

    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)
`;

const WORK_TYPES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS work_types (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    piecePrice REAL NOT NULL
        CHECK(piecePrice >= 0),

    active INTEGER DEFAULT 1,

    createdAt TEXT DEFAULT CURRENT_TIMESTAMP

)
`;


const WORKER_PRODUCTION_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS worker_production (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    workerId INTEGER NOT NULL,
    
    cycleId INTEGER NOT NULL REFERENCES account_cycles(id),

    workTypeId INTEGER NOT NULL,
    
    quantity INTEGER NOT NULL
        CHECK(quantity > 0),

    productionDate TEXT NOT NULL,

    notes TEXT,

    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(workerId) REFERENCES workers(id),

    FOREIGN KEY(workTypeId) REFERENCES work_types(id)
)
`;
const CUSTOMER_SCHEMA_SQL = `
      CREATE TABLE IF NOT EXISTS customers (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    phone TEXT NOT NULL UNIQUE,

    address TEXT,

    notes TEXT,
    category TEXT NOT NULL
    DEFAULT 'temporary'
    CHECK(category IN ('temporary', 'regular')),
    hasAccount INTEGER NOT NULL DEFAULT 0,
    isArchived INTEGER NOT NULL DEFAULT 0,

    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updatedAt TEXT

);
`

const PRODUCT_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL,
    sizes TEXT,
    description TEXT,
    imageUrl TEXT,
    stock INTEGER,
    active BOOLEAN,
    deleted INTEGER DEFAULT 0
  )
`;

const ORDER_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerId INTEGER NOT NULL REFERENCES customers(id),
    cycleId INTEGER NOT NULL REFERENCES account_cycles(id),
    customerName TEXT,
    phone TEXT,
    address TEXT,
    product TEXT,
    size TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    totalPrice REAL NOT NULL , 
    status TEXT DEFAULT 'pending',
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    productId INTEGER NOT NULL REFERENCES products(id)
    
    
  )
`;

//   Transaction Schema with all corrections
const TRANSACTION_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    type TEXT NOT NULL CHECK (
      type IN (
        'sale',
        'customer_payment',
        'purchase',
        'expense',
        'salary',
        'worker_advance',
        'refund',
        'deposit',
        'withdrawal',
        'adjustment'
      )
    ),
    direction TEXT NOT NULL CHECK (
      direction IN ('IN', 'OUT')
    ),

    amount REAL NOT NULL CHECK (amount >= 0),

    entityType TEXT CHECK (
  entityType IN (
    'customer',
    'worker',
    'supplier',
    'cashbox'
  )
),
    entityId INTEGER,

    cycleId INTEGER NOT NULL REFERENCES account_cycles(id),

    orderId INTEGER REFERENCES orders(id),

    note TEXT,

    transactionDate TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'completed' CHECK (
      status IN ('completed', 'pending', 'cancelled', 'draft')
    ),

    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;
// ============================================
// Account Cycles Schema
// ============================================

const ACCOUNT_CYCLES_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS account_cycles (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    accountType TEXT NOT NULL
    CHECK (
      accountType IN (
        'customer',
        'worker',
        'supplier',
        'cashbox'
      )
    ),

    entityId INTEGER NOT NULL,

    status TEXT NOT NULL
    DEFAULT 'open'
    CHECK (
      status IN (
        'open',
        'closed'
      )
    ),

    openedAt TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP,

    closedAt TEXT,

    createdAt TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP,

    updatedAt TEXT NOT NULL
    DEFAULT CURRENT_TIMESTAMP

  )
`;
// ============================================
// Create Account Cycles Indexes
// ============================================

const createAccountCycleIndexes = async () => {

  try {

    // Search by entity
    await execAsync(`
      CREATE INDEX IF NOT EXISTS idx_account_cycles_entity
      ON account_cycles(accountType, entityId)
    `);

    // Search by status
    await execAsync(`
      CREATE INDEX IF NOT EXISTS idx_account_cycles_status
      ON account_cycles(status)
    `);

    // Search by opening date
    await execAsync(`
      CREATE INDEX IF NOT EXISTS idx_account_cycles_opened_at
      ON account_cycles(openedAt)
    `);

    // Only one open cycle per entity
    await execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_account_cycles_open
      ON account_cycles(accountType, entityId)
      WHERE status = 'open'
    `);

  } catch (error) {

    console.error(
      'Failed to create account cycle indexes:',
      error
    );

    throw error;

  }

};
// ============================================
// // ✅ ADDED: Transaction Indexes
// ============================================

const createTransactionIndexes = async () => {
  try {
    console.log('🔧 Creating transaction indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(entityType, entityId)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transactionDate)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_direction ON transactions(direction)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_orderId ON transactions(orderId)',
    ];

    for (const index of indexes) {
      await execAsync(index);
    }
    
    console.log('✅ Transaction indexes created successfully.');
  } catch (error) {
    console.error('❌ Failed to create transaction indexes:', error);
    throw error;
  }
};

const EXPECTED_ORDER_COLUMNS = [
  { name: 'id', type: 'INTEGER' },
  { name: 'customerId', type: 'INTEGER' },
  { name: 'customerName', type: 'TEXT' },
  { name: 'phone', type: 'TEXT' },
  { name: 'address', type: 'TEXT' },
  { name: 'product', type: 'TEXT' },
  { name: 'size', type: 'TEXT' },
  { name: 'price', type: 'REAL' },
  { name: 'quantity', type: 'INTEGER' },
  { name: 'totalPrice', type: 'REAL' },
  { name: 'status', type: 'TEXT' },
  { name: 'date', type: 'TEXT' },
  { name: 'productId', type: 'INTEGER' },
];
// ============================================
// ====== ensureProductsDeletedColumn ======
// ============================================

const ensureProductsDeletedColumn = async () => {
  try {
    const columns = await allAsync('PRAGMA table_info(products)');

    const hasDeletedColumn = columns.some(
      (column) => column.name === 'deleted'
    );

    if (!hasDeletedColumn) {
      console.log('🔧 Adding "deleted" column to products table...');
      await execAsync(
        'ALTER TABLE products ADD COLUMN deleted INTEGER DEFAULT 0'
      );
      console.log('✅ "deleted" column added successfully.');
    } else {
      console.log('✅ "deleted" column already exists.');
    }
  } catch (error) {
    console.error('❌ Failed to ensure deleted column:', error);
    throw error;
  }
};
// ============================================
// ====== Patch Products Schema ======
// ============================================

const patchProductsSchemaIfNeeded = async () => {
  try {
    const row = await getAsync(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'products'"
    );

    const schemaSql = typeof row?.sql === 'string' ? row.sql : '';

    if (!/sizes\s+ARRAY/i.test(schemaSql)) {
      console.log('✅ Products schema is already correct.');
      return;
    }

    console.log('🔧 Patching products schema...');

    const patchedSchemaSql = schemaSql.replace(/sizes\s+ARRAY/i, 'sizes TEXT');
    const versionRow = await getAsync('PRAGMA schema_version');
    const currentVersion = Number(Object.values(versionRow ?? {})[0] ?? 0);
    const nextVersion = currentVersion + 1;

    await execAsync('PRAGMA writable_schema = ON');

    try {
      await runAsync(
        'UPDATE sqlite_master SET sql = ? WHERE type = ? AND name = ?',
        [patchedSchemaSql, 'table', 'products']
      );

      await execAsync('PRAGMA writable_schema = OFF');
      await execAsync(`PRAGMA schema_version = ${nextVersion}`);
      console.log('✅ Products schema patched successfully.');
    } catch (error) {
      await execAsync('PRAGMA writable_schema = OFF').catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error('❌ Failed to patch products schema:', error);
    throw error;
  }
};

// ============================================
// ====== Ensure Orders Table ======
// ============================================

const ensureOrdersTable = async () => {
  try {
    const columns = await allAsync('PRAGMA table_info(orders)');

    if (columns.length === 0) {
      console.log('🔧 Creating orders table...');
      await execAsync(ORDER_SCHEMA_SQL);
      console.log('✅ Orders table created.');
      return;
    }

  } catch (error) {
    console.error('❌ Failed to ensure orders table:', error);
    throw error;
  }
};

// ============================================
// ====== initializeDatabase ======
// ============================================
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');

    await execAsync('PRAGMA foreign_keys = ON');
    await execAsync('PRAGMA busy_timeout = 5000');

    // ============================================
    // ====== Create products table ======
    // ============================================
    await execAsync(PRODUCT_SCHEMA_SQL);
    console.log('✅ Products table ensured.');

    // ============================================
    // ====== Patch schema if needed (sizes ARRAY → TEXT) ======
    // ============================================
    await patchProductsSchemaIfNeeded();

    // ============================================
    // ====== Ensure deleted column exists ======
    // ============================================
    await ensureProductsDeletedColumn();

    // ============================================
    // ====== Create transactions table (FIXED) ======
    // ============================================
    await execAsync(TRANSACTION_SCHEMA_SQL);
    console.log('✅ Transactions table ensured.');

    const columns1 = await allAsync('PRAGMA table_info(Transactions)');
    console.table(columns1);
    // ============================================
    // ====== Create workers table ======
    // ============================================
   
await execAsync(WORKERS_SCHEMA_SQL);
console.log('✅ Workers table ensured.');


    
    const columns = await allAsync('PRAGMA table_info(workers)');
    console.table(columns);

    // ============================================
    // ====== Create transaction indexes ======
    // ============================================
    await createTransactionIndexes();

    // ============================================
// ====== Create customers table ======
// ============================================

await execAsync(CUSTOMER_SCHEMA_SQL);
console.log('✅ Customers table ensured.');




// ============================================
// ✅ Get Customer Table Columns
// ============================================

const customerColumns = await allAsync(`
    PRAGMA table_info(customers)
`);

console.table(customerColumns);

// ============================================
// Create Account Cycles Table
// ============================================
await execAsync(ACCOUNT_CYCLES_SCHEMA_SQL);
// ============================================
// Create Account Cycles Indexes
// ============================================

await createAccountCycleIndexes();

    // ============================================
    // ====== Ensure orders table ======
    // ============================================
    await ensureOrdersTable();
   // ============================================
// ✅ Get Orders Table Columns
// ============================================

const orderColumns = await allAsync(`
    PRAGMA table_info(orders)
`);

console.table(orderColumns);
    // ============================================
    // ====== Create order index ======
    // ============================================
    await execAsync(
      'CREATE INDEX IF NOT EXISTS idx_orders_productId ON orders(productId)'
    );
    console.log('✅ Order index created.');

    // ============================================
    // ====== Create work types table ======
    // ============================================
    await execAsync(WORK_TYPES_SCHEMA_SQL);
    console.log('✅ Work types table ensured.');
    const tables = await allAsync(`
  SELECT name
  FROM sqlite_master
  WHERE type='table'
`);

console.table(tables);

const columns4 = await allAsync(`
  PRAGMA table_info(worker_production)
`);

console.table(columns4);

    // ============================================
    // ====== Seed work types ======
    // ============================================
    await seedWorkTypes();

    
    // ============================================
    // ====== Create worker production table ======
    // ============================================
    await execAsync(WORKER_PRODUCTION_SCHEMA_SQL);
    console.log('✅ Worker production table ensured.');

    console.log('✅ Database initialization complete!');

  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// =========================
// Seed Work Types
// =========================
const seedWorkTypes = async () => {

    const workTypes = [

        { name: 'Shirt',   piecePrice: 120 },

        { name: 'Pants',   piecePrice: 80 },

        { name: 'Jacket',  piecePrice: 150 },

        { name: 'Abaya',   piecePrice: 200 },

        { name: 'Jellaba', piecePrice: 180 }

    ];

    for (const workType of workTypes) {

        await runAsync(

            `
            INSERT OR IGNORE INTO work_types
            (
                name,
                piecePrice
            )
            VALUES
            (
                ?,
                ?
            )
            `,

            [

                workType.name,

                workType.piecePrice

            ]

        );

    }

    console.log('✅ Default work types ensured.');

};

// ====== Exports ======
export const databaseReady = initializeDatabase();
export { db, execAsync, getAsync, allAsync, runAsync };
export default db;