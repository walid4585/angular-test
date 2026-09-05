// customer-history-page.ts
import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalCustomersService } from '../../../shared/local-customers/local-customers.service';
import { FormsModule } from '@angular/forms';

// ============================================
// ✅ Interfaces
// ============================================

export interface Order {
  name?: string;
  product?: string;
  quantity: number;
  price: number;
}

export interface Payment {
  amount: number;
  date?: string;
  method?: string;
}

export interface Balance {
  totalOrders: number;
  totalPayments: number;
  remaining: number;
}

export interface CustomerCycle {
  id: number;
  status: 'open' | 'closed' | 'pending';
  openedAt: string;
  closedAt: string;
  orders: Order[];
  payments: Payment[];
  balance: Balance;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  since?: string;
}

// ============================================
// ✅ الـ Component
// ============================================

@Component({
  selector: 'app-customer-history-page',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './customer-history-page.html',
  styleUrl: './customer-history-page.css',
})
export class CustomerHistoryPage implements OnInit {
  
  // ============================================
  // 📦 Properties
  // ============================================
   filteredCycles: CustomerCycle[] = [];
  customerCycles: CustomerCycle[] = [];
  expandedCycle: number | null = null;
  customerId!: number;
  
  customer: Customer = {
    name: '',
    phone: '',
    email: '',
    address: '',
    since: ''
  };

 // ============================================
  // 🔍 Filter Properties
  // ============================================
  
  showFilter: boolean = false;
  
  filterOptions = {
    status: 'all' as 'all' | 'open' | 'closed' | 'pending',
    dateRange: 'all' as 'all' | '7days' | '30days' | '90days',
    searchTerm: '',
    minAmount: null as number | null,
    maxAmount: null as number | null
  };

  // ============================================
  // 🔧 Injections
  // ============================================
  
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly localCustomersService = inject(LocalCustomersService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================
  // 🚀 Lifecycle Hooks
  // ============================================

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.customerId = Number(params.get('id'));
      if (this.customerId) {
        this.loadCustomerHistory();
        this.loadCustomerInfo();
      }
    });
  }

  // ============================================
  // 📥 Data Loading
  // ============================================

  loadCustomerHistory(): void {
    this.localCustomersService
      .getCustomerCyclesHistory(this.customerId)
      .subscribe({
        next: (response: any) => {
          this.customerCycles = response.data || [];
           this.filteredCycles = [...this.customerCycles]; 
          
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('❌ Error loading cycles:', err);
        }
      });
  }

  loadCustomerInfo(): void {
 
    this.localCustomersService.getCustomerAccount(this.customerId).subscribe({
     next: (response: any) => {

    this.customer = response.data.customer;

   
    this.cdr.markForCheck();

},
      error: (err) => {
        console.error('Failed to load customer orders', err);
      },
    });
  }

  // ============================================
  // 🎯 UI Actions
  // ============================================

toggleCycle(cycleId: number): void {
  this.expandedCycle =
    this.expandedCycle === cycleId ? null : cycleId;
}
toggleFilter(): void {
    this.showFilter = !this.showFilter;
    if (!this.showFilter) {
      // إذا أغلقنا الفلتر، نعيد تعيين الخيارات
      this.resetFilters();
    }
  }

// ============================================
  // 🔍 Filter Logic
  // ============================================

  applyFilters(): void {
    this.filteredCycles = this.customerCycles.filter(cycle => {
      let matches = true;

      // 1️⃣ فلتر حسب الحالة
      if (this.filterOptions.status !== 'all') {
        matches = matches && cycle.status === this.filterOptions.status;
      }

      // 2️⃣ فلتر حسب التاريخ
      if (this.filterOptions.dateRange !== 'all') {
        const cycleDate = new Date(cycle.openedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - cycleDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (this.filterOptions.dateRange) {
          case '7days':
            matches = matches && diffDays <= 7;
            break;
          case '30days':
            matches = matches && diffDays <= 30;
            break;
          case '90days':
            matches = matches && diffDays <= 90;
            break;
        }
      }

      // 3️⃣ فلتر بالبحث (رقم الدورة أو أي حقل آخر)
      if (this.filterOptions.searchTerm.trim()) {
        const search = this.filterOptions.searchTerm.toLowerCase().trim();
        matches = matches && (
          cycle.id.toString().includes(search) ||
          cycle.status.toLowerCase().includes(search) ||
          cycle.openedAt.includes(search) ||
          cycle.closedAt.includes(search)
        );
      }

      // 4️⃣ فلتر حسب الحد الأدنى للمبلغ
      if (this.filterOptions.minAmount !== null) {
        matches = matches && cycle.balance.totalOrders >= this.filterOptions.minAmount;
      }

      // 5️⃣ فلتر حسب الحد الأقصى للمبلغ
      if (this.filterOptions.maxAmount !== null) {
        matches = matches && cycle.balance.totalOrders <= this.filterOptions.maxAmount;
      }

      return matches;
    });

    // إعادة تعيين التوسيع بعد التصفية
    this.expandedCycle = null;
    this.cdr.markForCheck();
    
    console.log(`✅ Filter applied: ${this.filteredCycles.length} cycles found`);
  }

  resetFilters(): void {
    this.filterOptions = {
      status: 'all',
      dateRange: 'all',
      searchTerm: '',
      minAmount: null,
      maxAmount: null
    };
    this.filteredCycles = [...this.customerCycles];
    this.cdr.markForCheck();
  }

  // ============================================
  // 📊 Statistics with Filters
  // ============================================

  getFilteredTotalOrders(): number {
    return this.filteredCycles.reduce((total, cycle) => {
      return total + (cycle.balance?.totalOrders || 0);
    }, 0);
  }

  getFilteredTotalSpent(): number {
    return this.filteredCycles.reduce((total, cycle) => {
      return total + (cycle.balance?.totalPayments || 0);
    }, 0);
  }

  getFilteredCount(): number {
    return this.filteredCycles.length;
  }


  goBack(): void {
    window.history.back();
  }

  // ============================================
  // 🖨️ Print & Share
  // ============================================

  printInvoice(cycle: CustomerCycle): void {
    console.log('🖨️ Printing invoice for cycle:', cycle);
    window.print();
  }

  shareCycle(cycle: CustomerCycle): void {
    console.log('📤 Sharing cycle:', cycle);
    // TODO: Implement share logic
    // يمكنك استخدام Web Share API
    if (navigator.share) {
      navigator.share({
        title: `Cycle #${cycle.id}`,
        text: `Cycle #${cycle.id} - Total: ${cycle.balance.totalOrders} DA`,
        url: window.location.href,
      }).catch(err => {
         console.log('Share cancelled:', err);
         navigator.clipboard.writeText(`Cycle #${cycle.id} - Total: ${cycle.balance.totalOrders} DA`).then(() => {
        alert('Cycle details copied to clipboard! ');
      });
    });
    } else {
      // Fallback: copy to clipboard
      const text = `Cycle #${cycle.id}\nTotal: ${cycle.balance.totalOrders} DA\nPaid: ${cycle.balance.totalPayments} DA\nRemaining: ${cycle.balance.remaining || 0} DA`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Cycle details copied to clipboard!');
      });
    }
  }

  // ============================================
  // 📊 Calculations
  // ============================================

  getTotalOrders(): number {
    return this.customerCycles.reduce((total, cycle) => {
      return total + (cycle.balance?.totalOrders || 0);
    }, 0);
  }

  getTotalSpent(): number {
    return this.customerCycles.reduce((total, cycle) => {
      return total + (cycle.balance?.totalPayments || 0);
    }, 0);
  }

  getAverageOrder(): number {
    const total = this.getTotalOrders();
    const count = this.customerCycles.length;
    if (count === 0) return 0;
    return Math.round(total / count);
  }

  getTotalQuantity(orders: Order[]): number {
    return orders.reduce((sum, order) => sum + (order.quantity || 0), 0);
  }

  getDuration(cycle: CustomerCycle): string {
    if (!cycle.openedAt || !cycle.closedAt) return '';
    const start = new Date(cycle.openedAt);
    const end = new Date(cycle.closedAt);
    const diff = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 1 ? '1 day' : `${days} days`;
  }

  getProgress(paid: number, total: number): number {
    if (total === 0) return 0;
    const progress = (paid / total) * 100;
    return Math.min(Math.round(progress), 100);
  }

  // ============================================
  // 🎨 Helpers
  // ============================================

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #4F46E5, #7C3AED)',
      'linear-gradient(135deg, #EC4899, #F43F5E)',
      'linear-gradient(135deg, #10B981, #059669)',
      'linear-gradient(135deg, #F59E0B, #D97706)',
      'linear-gradient(135deg, #3B82F6, #2563EB)',
      'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    ];
    
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // ============================================
  // 🎯 Status Helpers
  // ============================================

  getStatusColor(status: string): string {
    const colors = {
      'closed': 'success',
      'open': 'primary',
      'pending': 'warning'
    };
    return colors[status as keyof typeof colors] || 'medium';
  }

  getStatusIcon(status: string): string {
    const icons = {
      'closed': 'checkmark-circle',
      'open': 'time',
      'pending': 'hourglass'
    };
    return icons[status as keyof typeof icons] || 'help-circle';
  }
}