import { Routes } from '@angular/router';
import { AddProductComponent } from './pages/add-product/add-product';
import { CustomersComponent } from './pages/customers/customers';
import { DashboardPlaceholderComponent } from './pages/dashboard-placeholder/dashboard-placeholder';
import { DeleteProductComponent } from './pages/delete-product/delete-product';
import { EditProductComponent } from './pages/edit-product/edit-product';
import { NewOrdersComponent } from './pages/create-new-orders/create-new-orders';
import { SalesOverview } from './pages/sales-overview/sales-overview';
import { CustomerPage } from './pages/customers-pages/customer-page/customer-page';
import { Workers } from './pages/workers/workers';
import { WorkTypes } from './pages/work-types/work-types';
import { CustomerHistoryPage } from './pages/customers-pages/customer-history-page/customer-history-page';

const placeholderRoute = (path: string, title: string): Routes[number] => ({
  path,
  component: DashboardPlaceholderComponent,
  data: {
    title,
    description: 'This feature is under development.',
  },
});

export const routes: Routes = [
  {
    path: '',
    component: SalesOverview,
    pathMatch: 'full',
  },
  {
    path: 'add-product',
    component: AddProductComponent,
  },
  {
    path: 'edit-product',
    component: EditProductComponent,
  },
  {
    path: 'delete-product',
    component: DeleteProductComponent,
  },
  {
    path: 'Add New Order',
    component: NewOrdersComponent,
  },
  {
    path: 'customers',
    component: CustomersComponent,
  },
  {
    path: 'customer/:id',
    component: CustomerPage,
  },
  {
  path: 'customer/:id/history',
  component: CustomerHistoryPage
},
  {
  path: 'workers',
  component: Workers,
},
  {
  path: 'workers/:id',
  loadComponent: () =>
    import('./pages/worker-details/worker-details')
      .then(c => c.WorkerDetails),

  children: [

    {
      path: 'piece',
      loadComponent: () =>
        import('./pages/worker-details/piece-worker/piece-worker')
          .then(c => c.PieceWorker)
    },

    {
      path: 'monthly',
      loadComponent: () =>
        import('./pages/worker-details/monthly-worker/monthly-worker')
          .then(c => c.MonthlyWorker)
    },

    {
      path: 'tailor',
      loadComponent: () =>
        import('./pages/worker-details/tailor-worker/tailor-worker')
          .then(c => c.TailorWorker)
    },

    

  ]
},
// ============================================
// Worker History 
// ============================================

{
  path: 'workers/:id/history',
  loadComponent: () =>
    import('./pages/worker-details/worker-history/worker-history')
      .then(c => c.WorkerHistoryComponent)
},
// ============================================
  // Work Types
  // ============================================

  {
    path: 'work-types',
    component: WorkTypes
  },

  
  placeholderRoute('orders-stats', 'Orders Stats'),
  placeholderRoute('revenue', 'Revenue'),
  placeholderRoute('processing', 'Processing'),
  placeholderRoute('delivered', 'Delivered'),
  placeholderRoute('categories', 'Categories'),
  placeholderRoute('block-users', 'Block / Unblock Users'),
  placeholderRoute('transactions', 'Transactions'),
  placeholderRoute('refunds', 'Refunds'),
  placeholderRoute('sales-charts', 'Sales Charts'),
  placeholderRoute('best-selling', 'Best Selling Products'),
  placeholderRoute('store-info', 'Store Info'),
  placeholderRoute('shipping', 'Shipping Settings'),
  {
    path: '**',
    redirectTo: '',
  },
];
