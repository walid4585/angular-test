import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Worker } from '../../models/worker.model';
import { WorkersService } from '../../shared/workers/workers.service';
import { TransactionsService } from '../../shared/transactions/transactions.service';
import { Transaction } from '../../models/transaction.model';
import { BaseModal } from '../../layout/base-modal/base-modal';
import { WorkerStats } from "./worker-stats/worker-stats";
import { AccountCyclesService } from '../../shared/account-cycles/account-cycles.service';
import { AccountCycle } from '../../models/account-cycle.model';
import { WorkerProduction } from '../../models/worker-production.model';





@Component({
  selector: 'app-worker-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseModal, RouterOutlet, WorkerStats, RouterLink],
  templateUrl: './worker-details.html',
  styleUrl: './worker-details.css'
})
export class WorkerDetails implements OnInit {

  // ============================================
  // ✅ Dependencies
  // ============================================

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workersService = inject(WorkersService);
  private readonly transactionsService = inject(TransactionsService);
  private fb = inject(FormBuilder);
  private readonly accountCyclesService = inject(AccountCyclesService);

   // ============================================
// ✅ Delete Modal
// ============================================

showDeleteModal = signal(false);

selectedProduction = signal<WorkerProduction | null>(null);

  // ============================================
  // ✅ Signals - Worker
  // ============================================

  worker = signal<Worker | null>(null);
  // Keep the parent's signal separate from the child's @Input() with the
  // same conceptual name. This prevents routed-component input assignment
  // from ever replacing the signal itself.
   currentCycle = signal<AccountCycle | null>(null);

  loading = signal(false);
  paymentSuccess = signal(false);
 
  // ============================================
  // ✅ Signals - Statistics
  // ============================================


  
  
  totalEarned = signal(0);

  production = signal<WorkerProduction[]>([]);

  summaryGrandTotal = computed(() =>
    this.production().reduce((sum, item) => sum + (item.total ?? 0), 0)
  );
  // ============================================
// ✅ Total Paid
// ============================================

totalPaid = computed(() => {

    return this.payments().reduce(

        (sum, payment) => sum + payment.amount,

        0

    );

});




// ============================================
// ✅ Payment Modal
// ============================================

showPaymentModal = signal(false);

// ============================================
// ✅ Editing Payment
// ============================================

editingPayment = signal<Transaction | null>(null);

// ============================================
// ✅ Delete Payment
// ============================================

selectedPayment = signal<Transaction | null>(null);

showDeletePaymentModal = signal(false);
  
  
 

// ============================================
// ✅ Worker Payments
// ============================================

payments = signal<Transaction[]>([]);
paymentForm: FormGroup = this.fb.group({

  amount: [0, [Validators.required, Validators.min(1)]],

  date: [
    new Date().toISOString().substring(0,10),
    Validators.required
  ],

  note: ['']

});


  private activeChild: any = null;

  private syncChildInputs(): void {
    if (!this.activeChild) return;

    // PieceWorker and TailorWorker expose `worker` as a signal, while
    // MonthlyWorker uses a regular @Input. Do not replace a signal with its
    // current value, otherwise later calls to `worker.set()` will fail.
    if (typeof this.activeChild.worker?.set === 'function') {
      this.activeChild.worker.set(this.worker());
    } else {
      this.activeChild.worker = this.worker();
    }

    if (typeof this.activeChild.currentCycle?.set === 'function') {
      this.activeChild.currentCycle.set(this.currentCycle());
    } else if ('currentCycle' in this.activeChild) {
      this.activeChild.currentCycle = this.currentCycle();
    }
  }


onChildActivate(component: any): void {

  this.activeChild = component;

  // ============================================
  // Send current cycle to child
  // ============================================

  this.syncChildInputs();

  // ============================================
  // Production Changed
  // ============================================

  if (component.productionChanged) {

    component.productionChanged.subscribe(() => {

      const id = this.route.snapshot.paramMap.get('id');

      if (id) {
        this.loadWorker(Number(id));
      }

    });

  }

  // ============================================
  // Start Cycle
  // ============================================

  if (component.startCycle) {

    component.startCycle.subscribe(() => {

      this.startWorkerCycle();

    });

  }

}


startWorkerCycle(): void {

  const worker = this.worker();

  if (!worker?.id) {
    return;
  }

  const workerId = worker.id;

  this.accountCyclesService
    .startAccountCycle('worker', workerId)
    .subscribe({

      next: (response) => {

        console.log('Worker cycle started:', response);

        this.loadWorker(workerId);

      },

      error: (error) => {

        console.error('Failed to start worker cycle:', error);

      }

    });

}


// ============================================
// ✅ Payment Modal
// ============================================

addPayment(): void {
     
    this.showPaymentModal.set(true);
    

}








  // ============================================
  // ✅ Init
  // ============================================

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loadWorker(id);
    
  }
  

  // ============================================
  // ✅ Load Worker
  // ============================================

  private loadWorker(id: number): void {



  this.loading.set(true);

  this.workersService
    .getWorkerDetails(id)
    .subscribe({

      next: (response) => {

        

        this.worker.set(response.worker);

        this.currentCycle.set(response.currentCycle ?? null);

        // The route may stay the same after starting a cycle, so the
        // RouterOutlet does not necessarily emit "activate" again.
        this.syncChildInputs();

        

        this.production.set(response.productions);

        this.payments.set(response.payments ?? []);
        

        this.router.navigate([response.worker.paymentType], {

          relativeTo: this.route,

          replaceUrl: true

        });

        this.loading.set(false);

      },

      error: (error) => {

        console.error(error);

        this.loading.set(false);

      }

    });

}

  

 
  // ============================================
  // ✅ Go Back
  // ============================================

  goBack(): void {
    history.back();
  }
  

// ============================================
// ✅ Financial Summary
// ============================================

totalDue = computed(() => {

    return this.worker()?.paymentType === 'monthly'
      ? this.worker()?.monthlySalary ?? 0
      : this.summaryGrandTotal();

});

   

debt = computed(() => {

    return this.totalDue() - this.totalPaid();

});




// ============================================
// ✅ Load Worker Payments
// ============================================

  loadPayments(): void {
   
    const worker = this.worker();

    if (!worker?.id) return;

    this.workersService.getWorkerDetails(worker.id).subscribe({
      next: (response) => {
        this.payments.set(response.payments ?? []);
      },
      error: (error) => {
        console.error('Failed to load worker payments:', error);
      }
    });

}

// ============================================
// ✅ Open Payment Modal
// ============================================

openPaymentModal(): void {

    this.showPaymentModal.set(true);

}

// ============================================
// ✅ Close Payment Modal
// ============================================

closePaymentModal(): void {

    this.showPaymentModal.set(false);

    this.paymentSuccess.set(false);

    this.paymentForm.reset({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

}
// ============================================
  // ✅ Payments
  // ============================================

  

  
  savePayment(): void {
    if (this.paymentForm.invalid) return;

    const paymentData = this.paymentForm.value;

    if (this.editingPayment()) {

    // Update Transaction
     const payment = this.editingPayment()!;

        const dto: Transaction = {
    id: payment.id!,
    type: 'salary',
    direction: 'OUT',
    amount: paymentData.amount,
    entityType: 'worker',
    entityId: this.worker()!.id!,
    note: paymentData.note ?? '',
    transactionDate: paymentData.date ?? '',
    status: 'completed'
};
        this.transactionsService
            .updateTransaction(payment.id!, dto)
            .subscribe(() => {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadPayments();

    this.loadWorker(id);

    this.paymentSuccess.set(true);

    setTimeout(() => {

        this.paymentSuccess.set(false);

        this.closePaymentModal();

    }, 3000);

});

} else {

    // Create Transaction

     this.transactionsService
      .createTransaction({
        type: 'salary',
        direction: 'OUT',
        amount: paymentData.amount,
        entityType: 'worker',
        entityId: this.worker()?.id!,
        note: paymentData.note|| '',
        transactionDate: paymentData.date|| '',
        status: 'completed'

      })
      .subscribe({
        next: () => {
          this.paymentSuccess.set(true);

          // Refresh the cycle as well as the payments. The backend may close
          // the open cycle after this payment reaches the full balance.
          const id = this.worker()?.id;
          if (id) {
            this.loadWorker(id);
          }

          setTimeout(() => {

            this.paymentSuccess.set(false);

            this.closePaymentModal();

          }, 3000);
          this.loadPayments();
        },
        error: (error) => {
          console.error(error);
        }
      });

}

   
  }

  // ============================================

  printPage(): void {
    // TODO: Print page
  }
  // ============================================
// ✅ Edit Payment
// ============================================

editPayment(payment: Transaction): void {

    this.editingPayment.set(payment);

    this.paymentForm.patchValue({

        amount: payment.amount,
        date: payment.transactionDate,
        note: payment.note

    });

    this.paymentSuccess.set(false);

    this.showPaymentModal.set(true);

}

// ============================================
// ✅ Delete Payment
// ============================================

deletePayment(payment: Transaction): void {

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

    if (!payment) return;

    this.transactionsService
        .deleteTransaction(payment.id!)
        .subscribe({

            next: () => {

                this.loadPayments();

                this.closeDeletePaymentModal();

            },

            error: (err) => {

                console.error(err);

            }

        });

}
}
