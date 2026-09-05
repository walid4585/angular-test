import { LocalProductesService } from './../../shared/local-product/local-productes.service';
import { CommonModule,DatePipe,TitleCasePipe, } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Order } from '../../models/order.model';
import { LocalOrdersService } from '../../shared/local-orders/local-orders.service';
import { DashboardLayoutService } from '../dashboard-layout.service';
import { ModalComponent } from '../modal/modal';
import { ToastService } from '../../shared/toast/toast';
import { FormsModule} from '@angular/forms';
import { ProductRecord } from '../../models/product.model';
import { ActivatedRoute, RouterLink } from '@angular/router';




@Component({
  selector: 'app-local-orders-table',
  imports: [CommonModule,DatePipe,TitleCasePipe ,ModalComponent,FormsModule,RouterLink],
  templateUrl: './local-orders-table.html',
  styleUrl: '../../pages/sales-overview/sales-overview.css',
})
export class LocalOrdersTable {
  readonly phone = signal('');
// ============================================
// ✅ Services
// ============================================

private readonly localOrdersService = inject(LocalOrdersService);
private readonly layout = inject(DashboardLayoutService);
private readonly toast = inject(ToastService);
private readonly productsService = inject(LocalProductesService)
private readonly route = inject(ActivatedRoute);
// ============================================
// ✅ Edit Modal
// ============================================

readonly showEditModal = signal(false);
readonly products = signal<ProductRecord[]>([]);
readonly editingOrder = signal<Order | null>(null);
// ============================================
// ✅ Delete Confirmation
// ============================================

readonly showDeleteModal = signal(false);

readonly selectedOrder = signal<Order | null>(null);

// ============================================
// ✅ Local Orders State
// ============================================

readonly orders = signal<Order[]>([]);
readonly loadingOrders = signal(true);

ngOnInit(): void {

  this.loadOrders();
  this.loadProducts();
  this.phone.set(

    this.route.snapshot.paramMap.get('phone') ?? ''

  );

}

private loadProducts(): void {

  this.productsService.getProducts().subscribe({

    next: (products) => {

      this.products.set(products);

    },

    error: console.error

  });

}

// ============================================
// ✅ Open Edit Modal
// ============================================

openEditModal(order: Order): void {

  this.editingOrder.set({ ...order });

  this.showEditModal.set(true);

}


// ============================================
// ✅ Close Edit Modal
// ============================================

closeEditModal(): void {

  this.showEditModal.set(false);

  this.editingOrder.set(null);

}

// ============================================
// ✅ Load Local Orders
// ============================================

private loadOrders(): void {

  this.loadingOrders.set(true);

  this.localOrdersService
    .getLocalOrders()
    .subscribe({

       next: (orders) => {

      this.orders.set(orders);

      this.loadingOrders.set(false);

    },

      error: (error) => {

        console.error('Failed to load local orders:', error);

        this.orders.set([]);

        this.loadingOrders.set(false);

      },

    });

}

// ============================================
// ✅ Visible Local Orders
// ============================================

readonly visibleOrders = computed(() => {

  const term = this.layout.searchTerm().trim().toLowerCase();

  if (!term) {
    return this.orders();
  }

  return this.orders().filter(order =>
    this.matchesSearch(order, term)
  );

});

// ============================================
// ✅ Product Changed
// ============================================

onProductChanged(productId: string): void {

  const order = this.editingOrder();

  if (!order) {
    return;
  }

  const product = this.products().find(p => p.id === productId);

  if (!product) {
    return;
  }

  order.product = product.title;

  order.price = product.price;

  order.totalPrice = order.price * order.quantity;

}

// ============================================
// ✅ Update Total
// ============================================

updateTotal(): void {

  const order = this.editingOrder();

  if (!order) {
    return;
  }

  const price = order.price ?? 0;
  const quantity = order.quantity ?? 0;

  order.totalPrice = price * quantity;

}

// ============================================
// ✅ Save Order Changes
// ============================================

saveOrderChanges(): void {
  console.log('save button clickي')

  const order = this.editingOrder();

  if (!order) {

    return;

  }

  this.localOrdersService.updateOrder(order).subscribe({

    next: () => {

      this.toast.success('Order updated successfully.');

      this.closeEditModal();

      this.loadOrders();

    },

    error: (error) => {

      console.error(error);

      this.toast.error('Failed to update order.');

    }

  });

}

// ============================================
// ✅ Search Matcher
// ============================================

private matchesSearch(order: Order, term: string): boolean {

  const searchText = [

    order.id,

    order.customerName,

    order.phone,

    order.address,

    order.product,

    order.size,

    String(order.quantity),

    String(order.totalPrice),

    order.status,

  ]
    .join(' ')
    .toLowerCase();

  return searchText.includes(term);

}

// ============================================
// ✅ Track By Order
// ============================================

trackByOrder(_: number, order: Order): string {

  return order.id;

}
// ============================================
// ✅ Order Status Class
// ============================================

getStatusClass(status: Order['status']): string {

  return `status-${status}`;

}

// ============================================
// ✅ Open Delete Confirmation
// ============================================

openDeleteModal(order: Order): void {

  this.selectedOrder.set(order);

  this.showDeleteModal.set(true);

}
// ============================================
// ✅ Close Delete Confirmation
// ============================================

closeDeleteModal(): void {

  this.showDeleteModal.set(false);

  this.selectedOrder.set(null);

}
// ============================================
// ✅ Delete Selected Order
// ============================================

confirmDelete(): void {

  const order = this.selectedOrder();

  if (!order) {
    return;
  }

  this.localOrdersService.deleteOrder((order.id)).subscribe({

    next: () => {

      this.loadOrders();

      this.closeDeleteModal();

      this.toast.success('Order deleted successfully.');

    },

    error: (error) => {

      console.error(error);

      this.toast.error('Failed to delete order.');

    }

  });

}

}
