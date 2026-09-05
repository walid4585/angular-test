import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { databaseReady } from './module/database.js';
import ordersRouter from './routes/orders.routes.js';
import productsRouter from './routes/productes.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import workerRoutes from './routes/workers.routes.js';
import workTypesRoutes from './routes/workType.routes.js';
import workerProductionRoutes from './routes/workerProduction.routes.js';
import customerRoutes from './routes/customer.routes.js';
import accountCyclesRoutes from './routes/accountCycles.routes.js';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, 'uploads');

app.use(
  cors({
    origin: ['http://localhost:4200', 'https://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH' ,'OPTIONS'],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir));
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/transactions', transactionsRoutes);
app.use('/workers', workerRoutes);
app.use('/api/work-types', workTypesRoutes);
app.use('/api/worker-production', workerProductionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/account-cycles', accountCyclesRoutes);

const startServer = async () => {
  try {
    await databaseReady;

    app.listen(5000, () => {
      console.log('Server running on http://localhost:5000');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void startServer();
