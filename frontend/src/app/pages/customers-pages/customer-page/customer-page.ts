import { CommonModule   } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder,FormsModule, Validators } from '@angular/forms';
import { TransactionsService } from '../../../shared/transactions/transactions.service';
import { LocalOrdersService } from '../../../shared/local-orders/local-orders.service';
import { Transaction } from '../../../models/transaction.model';
import { Order } from '../../../models/order.model';
import { ModalComponent } from '../../../layout/modal/modal'
import { ToastService } from '../../../shared/toast/toast';
import { ProductRecord } from '../../../models/product.model';
import { LocalProductesService } from '../../../shared/local-product/local-productes.service';
import {LocalCustomersService} from '../../../shared/local-customers/local-customers.service';
import { RouterLink } from '@angular/router';
interface CustomerInfo {
  id: number;

  name: string;

  phone: string;

  address: string;

  hasOpenCycle: number | boolean;

}
interface PaymentRecord {
  id: number;

  amount: number;

  date: string;

  description: string;

}
@Component({
  selector: 'app-customer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,FormsModule,RouterLink, ModalComponent],
  templateUrl: './customer-page.html',
  styleUrls: ['./customer-page.css'],
})
export class CustomerPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(LocalOrdersService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private readonly transactionsService = inject(TransactionsService);
  private readonly toast = inject(ToastService);
  private readonly productsService = inject(LocalProductesService);
  private readonly localCustomersService = inject(LocalCustomersService);
  
get isActive(): boolean {
  return !!this.customer?.hasOpenCycle;
}

  customerId!: number;
  customer: CustomerInfo | null = null;
  orders: Order[] = [];
  payments: PaymentRecord[] = [];
  totalDue = 0;
  totalPaid = 0;
  debt = 0;

  showPaymentModal = false;
  paymentForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    note: [''],
  });
  paymentSuccess = false;
// ============================================
// ✅ Products
// ============================================

readonly products = signal<ProductRecord[]>([]);
  // ============================================
  // ✅ Init
  // ============================================
  ngOnInit(): void {

  this.route.paramMap.subscribe(params => {

    this.customerId = Number(params.get('id'));

    console.log('customerId =', this.customerId);

    if (this.customerId) {

      this.loadCustomerData();

     

    }

  });

  this.loadProducts();

}



 




// ============================================
// ✅ Load Products
// ============================================

private loadProducts(): void {

  this.productsService.getProducts().subscribe({

    next: (products) => {

      this.products.set(products);

    },

    error: console.error

  });

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
// ✅ Product Changed
// ============================================

onProductChanged(productId: string): void {

  const order = this.editingOrder();

  if (!order) {

    return;

  }

  const product = this.products().find(

    p => String(p.id) === productId

  );

  if (!product) {

    return;

  }

  order.product = product.title;

  order.price = product.price;

  order.totalPrice = order.price * order.quantity;

}

// ============================================
// ✅ Save Order Changes
// ============================================

saveOrderChanges(): void {
console.log('save order changes worker');
  const order = this.editingOrder();

  if (!order) {

    return;

  }

  this.ordersService.updateOrder(order).subscribe({

    next: () => {

      this.loadCustomerData();

      this.closeEditOrderModal();

    },

    error: (error) => {

      console.error(error);

    }

  });

}
  // ============================================
  // ✅ Load Customer Data
  // ============================================
  loadCustomerData(): void {
    console.log('Customer Id:', this.customerId);
    this.localCustomersService.getCustomerAccount(this.customerId).subscribe({
     next: (response: any) => {

    this.customer = response.data.customer;

    this.orders = response.data.orders;

    this.payments = response.data.payments;

    this.totalDue = response.data.balance?.totalOrders ?? 0;

    this.totalPaid = response.data.balance?.totalPayments ?? 0;

    this.debt = response.data.balance?.remaining ?? 0;

    this.cdr.markForCheck();

},
      error: (err) => {
        console.error('Failed to load customer orders', err);
      },
    });
  }

  // ============================================
  // ✅ Load Payments
  // ============================================
  loadPayments(): void {
    this.transactionsService.getTransactions({
      entityType: 'customer',
      entityId: this.customer!.id
    }).subscribe({
      next: (transactions) => {
        this.payments = transactions.map(transaction => ({
          id: transaction.id!,
          amount: transaction.amount,
          date: transaction.transactionDate,
          description: transaction.note ?? ''
                            }));
        this.calculateSummary();
        this.cdr.markForCheck();
      }
    });
  }

  // ============================================
  // ✅ Calculate Summary
  // ============================================
  calculateSummary(): void {
    this.totalDue = this.orders.reduce(
      (sum, order) => sum + Number(order.totalPrice || 0),
      0
    );

    this.totalPaid = this.payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    this.debt = this.totalDue - this.totalPaid;
  }

  // ============================================
  // ✅ Computed Properties
  // ============================================
  get totalOrders(): number {
    return this.orders.length;
  }

  // ============================================
  // ✅ Format Currency
  // ============================================
  formatCurrency(amount: number): string {
    return amount.toLocaleString() + ' DA';
  }

  // ============================================
  // ✅ Helper: Get Initials
  // ============================================
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // ============================================
  // ✅ Helper: Get Avatar Color
  // ============================================
  getAvatarColor(name: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE',
      '#FD79A8', '#00CEC9', '#FDCB6E', '#6C5CE7',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#01a3a4',
      '#FF6B81', '#2ED573', '#1E90FF', '#F9CA24'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

// ============================================
// ✅ Go Back
// ============================================
  goBack(): void {
    window.history.back();
  }

  // ============================================
  // ✅ Add Payment
  // ============================================
  addPayment(): void {
    this.showPaymentModal = true;
  }

  // ============================================
  // ✅ Close Payment Modal
  // ============================================
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentSuccess = false;
    this.paymentForm.reset({
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      note: ''
    });
  }

  // ============================================
  // ✅ Save Payment
  // ============================================
  savePayment(): void {
    this.isEditingPayment.set(false);

    console.log(this.paymentForm.value);
    const form = this.paymentForm.value;
    const transaction: Transaction = {
      type: 'customer_payment',
      direction: 'IN',
      amount: form.amount!,
      entityType: 'customer',
      entityId: this.customer!.id,
      orderId: null,
      note: form.note ?? '',
      transactionDate: form.date!,
      status: 'completed'
    };
   console.log('transaction', transaction);
    this.transactionsService.createTransaction(transaction).subscribe({
      next: (response) => {
        // ثانياً: أظهر شاشة النجاح
        this.paymentSuccess = true;
        this.cdr.markForCheck();

        // ثالثاً: انتظر قليلاً
        setTimeout(() => {
          // أغلق المودال أولاً
          this.showPaymentModal = false;
          // ثم أعد الحالة للوضع الطبيعي
          this.paymentSuccess = false;
          // صفّر النموذج
          this.paymentForm.reset({
            amount: 0,
            date: new Date().toISOString().substring(0, 10),
            note: ''
          });
          // حدّث البيانات
          this.loadCustomerData();
        }, 1500);
      },
      error: (error) => {

  console.error(error);

  this.toast.error(

    error.error?.message ||

    'Failed to save payment.'

  );

}
    });
  }
  // ============================================
// ✅ Delete Payment
// ============================================

readonly selectedPayment = signal<PaymentRecord | null>(null);

readonly showDeletePaymentModal = signal(false);

// ============================================
// ✅ Open Delete Payment Modal
// ============================================

deletePayment(payment: PaymentRecord): void {
  

  this.selectedPayment.set(payment);

  this.showDeletePaymentModal.set(true);
}
// ============================================
// ✅ Close Delete Payment Modal
// ============================================

closeDeletePaymentModal(): void {

  this.showDeletePaymentModal.set(false);

  this.selectedPayment.set(null);

}
// ============================================
// ✅ Confirm Delete Payment
// ============================================

confirmDeletePayment(): void {

  const payment = this.selectedPayment();

  if (!payment) {

    return;

  }

  this.transactionsService
    .deleteTransaction(payment.id)
    .subscribe({

      next: () => {

        this.toast.success('Payment deleted successfully.');

        this.closeDeletePaymentModal();

        this.loadPayments();

      },

      error: (error) => {

        console.error(error);

        this.toast.error('Failed to delete payment.');

      }

    });

}

// ============================================
// ✅ Edit Payment
// ============================================

readonly showEditPaymentModal = signal(false);

readonly editingPayment = signal<PaymentRecord | null>(null);

readonly isEditingPayment = signal(false);
// ============================================
// ✅ Open Edit Payment Modal
// ============================================

editPayment(payment: PaymentRecord): void {

  this.isEditingPayment.set(true);

  this.selectedPayment.set(payment);

  this.paymentForm.patchValue({

    amount: payment.amount,

    date: payment.date,

    note: payment.description

  });

  this.showPaymentModal = true;

}
// ============================================
// ✅ Update Payment
// ============================================

updatePayment(): void {
  console.log('updatePayment button work');
   const form = this.paymentForm.value;
  const payment = this.selectedPayment();
  if (!payment) {

  return;

}
   const transaction: Transaction = {

    id: payment.id,

    type: 'customer_payment',

    direction: 'IN',

    amount: form.amount!,

    entityType: 'customer',

    entityId: Number(this.customerId),

    orderId: null,

    note: form.note ?? '',

    transactionDate: form.date!,

    status: 'completed'

  };

 

this.transactionsService.updateTransaction(

  payment.id,

  transaction

).subscribe({

  next: () => {
     this.paymentSuccess = true;
        this.cdr.markForCheck();
        // ثالثاً: انتظر قليلاً
        setTimeout(() => {
          // أغلق المودال أولاً
          this.showPaymentModal = false;
          // ثم أعد الحالة للوضع الطبيعي
          this.paymentSuccess = false;
          // صفّر النموذج
          this.paymentForm.reset({
            amount: 0,
            date: new Date().toISOString().substring(0, 10),
            note: ''
          });
          // حدّث البيانات
          this.loadCustomerData();
        }, 1500);
    
  },

 error: (error) => {

  console.error(error);

  this.toast.error(

    error.error?.message ||

    'Failed to edit payment.'

  );

}

});

}
// ============================================
// ✅ Close Edit Payment Modal
// ============================================

closeEditPaymentModal(): void {

  this.showEditPaymentModal.set(false);

  this.editingPayment.set(null);

}
// ============================================
// ✅ Save Payment Changes
// ============================================

savePaymentChanges(): void {

  console.log(this.editingPayment());

}



  // ============================================
  // ✅ New Order
  // ============================================
  newOrder(): void {
    console.log('New order for customer:', this.customer!.id);
  }

  // ============================================
// ✅ Delete Order
// ============================================

selectedOrder = signal<Order | null>(null);

showDeleteOrderModal = signal(false);
// ============================================
// ✅ Delete Order
// ============================================

deleteOrder(order: Order): void {

  this.selectedOrder.set(order);

  this.showDeleteOrderModal.set(true);

}
// ============================================
// ✅ Close Delete Order Modal
// ============================================

closeDeleteOrderModal(): void {

  this.showDeleteOrderModal.set(false);

  this.selectedOrder.set(null);

}
// ============================================
// ✅ Confirm Delete Order
// ============================================

confirmDeleteOrder(): void {

  const order = this.selectedOrder();

  if (!order) {

    return;

  }

  this.ordersService.deleteOrder(order.id).subscribe({

    next: () => {

      this.closeDeleteOrderModal();

      this.loadCustomerData();

    },

    error: (error) => {

      console.error('Failed to delete order', error);

    }

  });

}
// ============================================
// ✅ Edit Order
// ============================================

editingOrder = signal<Order | null>(null);

showEditOrderModal = signal(false);
// ============================================
// ✅ Edit Order
// ============================================

editOrder(order: Order): void {

  this.editingOrder.set({ ...order });

  this.showEditOrderModal.set(true);

}
// ============================================
// ✅ Close Edit Order Modal
// ============================================

closeEditOrderModal(): void {

  this.showEditOrderModal.set(false);

  this.editingOrder.set(null);

}
  // ============================================
  // ✅ Print Page
  // ============================================
  printPage(): void {
    window.print();
  }
}