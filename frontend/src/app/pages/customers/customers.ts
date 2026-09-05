import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject ,signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LocalCustomersService } from '../../shared/local-customers/local-customers.service';
import { BaseModal } from '../../layout/base-modal/base-modal';
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  ordersCount: number;
  category: 'temporary' | 'regular';
  hasAccount: number;
  hasOpenCycle: number | boolean;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BaseModal],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css'],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  isLoading = true;
  searchTerm = '';
  private readonly layout = inject(DashboardLayoutService);
  private readonly localCustomersService = inject(LocalCustomersService);
  private cdr = inject(ChangeDetectorRef);
// ============================================
// ✅ Customer Form Modal State
// ============================================

// Controls whether the Add Customer form is visible
showEditCustomerForm = signal(false);
showCustomerForm = signal(false);
//===========================================
// ✅ Delete Customer Modal State
// ============================================

// Controls whether the Delete Customer modal is visible
showDeleteModal = signal(false);

// ============================================
// ✅ Selected Customer
// ============================================

selectedCustomer = signal<Customer | null>(null);
// ============================================
// ✅ Filter Category & Account
// ============================================
filterCategory = signal<'all' | 'temporary' | 'regular'>('all');

filterAccount = signal<'all' | 'hasAccount' | 'noAccount'>('all');

  // ============================================
  // ✅ Init
  // ============================================
  ngOnInit(): void {
    this.layout.setPageTitle('Customers');
    this.loadCustomers();
  }


// ============================================
// ✅ Selected Status Varible
// ============================================
selectedStatus: 'all' | 'active' | 'inactive' = 'all'; 

// ============================================
// ✅ Change Status Filter
// ============================================
setStatusFilter(status: 'all' | 'active' | 'inactive'): void {
  this.selectedStatus = status;
}
// ============================================
// ✅ Total Customers
// ============================================
get totalCustomersCount(): number {
  return this.customers.length;
}

// ============================================
// ✅ Active Customers
// ============================================
get activeCustomersCount(): number {
  return this.customers.filter(c => this.hasOpenCycle(c)).length;
}

// ============================================
// ✅ Inactive Customers
// ============================================
get inactiveCustomersCount(): number {
  
  return this.customers.filter(c => !this.hasOpenCycle(c)).length;
}
// ============================================
// ✅ Open Delete Modal
// ============================================

  openDeleteModal(customer: Customer) {
  console.log(customer);
  this.selectedCustomer.set(customer);

  this.showDeleteModal.set(true);

}
// ============================================
// ✅ Close Delete Modal
// ============================================
closeDeleteModal() {

  this.showDeleteModal.set(false);

  this.selectedCustomer.set(null);

}
// ============================================
// ✅ Confirm Delete Customer
// ============================================
confirmDeleteCustomer() {

  // سنكتب منطق حذف العميل هنا لاحقًا

}
// ============================================
// ✅ Open Edit Customer Form
// ============================================

openEditCustomerForm(customer: Customer): void {

  console.log(customer);

  this.selectedCustomer.set(customer);

  this.showEditCustomerForm.set(true);

}


// ============================================
// ✅ Close Edit Customer Form
// ============================================

closeEditCustomerForm(): void {

  this.showEditCustomerForm.set(false);

}
  // ============================================
// ✅ Load Customers
// ============================================
loadCustomers(): void {
  this.isLoading = true;

  this.localCustomersService.getCustomers().subscribe({
    next: (customers) => {
      console.log(customers);
  console.log(Array.isArray(customers));
      this.customers = customers.data;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Failed to load customers', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    },
  });
}

  // ============================================
  // ✅ Filtered Customers
  // ============================================
  get filteredCustomers(): Customer[] {

  let customers = [...this.customers];

  // ==========================
  // Search
  // ==========================
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase().trim();

    customers = customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  }

  // ==========================
  // Category
  // ==========================
  if (this.filterCategory() !== 'all') {
    customers = customers.filter(
      c => c.category === this.filterCategory()
    );
  }

  // ==========================
  // Account
  // ==========================
  if (this.filterAccount() !== 'all') {

    customers = customers.filter(c => {

      if (this.filterAccount() === 'hasAccount') {
        return c.hasAccount;
      }

      return !c.hasAccount;

    });

  }

  if (this.selectedStatus !== 'all') {
    const wantsOpenCycle = this.selectedStatus === 'active';
    customers = customers.filter(c => this.hasOpenCycle(c) === wantsOpenCycle);
  }

  return customers;
}

 hasOpenCycle(customer: Customer): boolean {
    return customer.hasOpenCycle === true || Number(customer.hasOpenCycle) === 1;
  }

  // ============================================
  // ✅ Clear Search
  // ============================================
  clearSearch(): void {
    this.searchTerm = '';
  }

  // ============================================
  // ✅ Computed Properties
  // ============================================
  get totalCustomers(): number {
    return this.customers.length;
  }

 get totalOrders(): number {
  return this.customers.reduce(
    (sum, customer) => sum + customer.ordersCount,
    0
  );
}

  // ============================================
  // ✅ Helper Methods
  // ============================================
  getAverageOrders(): string {
    if (this.customers.length === 0) return '0';
    const avg = this.totalOrders / this.customers.length;
    return avg.toFixed(1);
  }

  getTopCustomer(): string {
  console.log(this.customers);
  if (this.customers.length === 0) {
    return 'N/A';
  }

  const top = this.customers.reduce((max, c) =>
    c.ordersCount > max.ordersCount ? c : max
  );

  return top.name.length > 12
    ? top.name.substring(0, 12) + '...'
    : top.name;
}

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE',
      '#FD79A8', '#00CEC9', '#FDCB6E', '#6C5CE7',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#01a3a4'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
