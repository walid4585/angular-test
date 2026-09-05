import { Component, OnInit, inject, signal } from '@angular/core';
import { Worker } from '../../models/worker.model';
import { WorkersService } from '../../shared/workers/workers.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';

@Component({
  selector: 'app-workers',
  imports: [CommonModule,  FormsModule,
  ReactiveFormsModule, RouterLink ],
  standalone: true,
  templateUrl: './workers.html',
  styleUrl: './workers.css',
})
export class Workers implements OnInit {
  private readonly layout = inject(DashboardLayoutService);
  private readonly workersService = inject(WorkersService);
  private fb = inject(FormBuilder);

  workers= signal<Worker[]>([]);
  filteredWorkers= signal<Worker[]>([]);
  searchTerm= signal<string>('');
  filterType= signal<string>('all');

// ============================================
// ✅ Add Worker Modal
// ============================================

showAddWorkerModal = false;

workerCreated = false;
// ============================================
// ✅ Create Worker Form
// ============================================

workerForm = this.fb.group({

  name: ['', Validators.required],

  phone: [''],

  address: [''],

  job: [''],

  paymentType: ['piece', Validators.required],

  monthlySalary: [0]

});
// ============================================
// ✅ Open Add Worker Modal
// ============================================

openAddWorkerModal(): void {

  this.showAddWorkerModal = true;

}

// ============================================
// ✅ Close Add Worker Modal
// ============================================

closeAddWorkerModal(): void {

  this.showAddWorkerModal = false;

  this.workerCreated = false;

  this.workerForm.reset({

    name: '',

    phone: '',

    address: '',

    job: '',

    paymentType: 'piece',

    monthlySalary: 0

  });

}

  // ============================================
  // ✅ Computed Properties
  // ============================================
  get activeWorkers(): number {
  return this.workers().filter(w => w.active === 1).length;
}

  get paymentTypes(): string[] {
    const types = new Set(this.workers().map(w => w.paymentType));
    return Array.from(types);
  }

  get totalProduction(): number {
    return this.workers().length * 42; // Placeholder - replace with actual production data
  }

  // ============================================
  // ✅ Init
  // ============================================
  ngOnInit(): void {
    this.layout.setPageTitle('Workers');
    this.loadWorkers();
  }

  // ============================================
  // ✅ Load Workers
  // ============================================
  loadWorkers(): void {
    this.workersService.getWorkers().subscribe({
      next: (workers) => {
        this.workers.set(workers);
        this.filteredWorkers.set(workers);
        
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  // ============================================
  // ✅ Filter Workers
  // ============================================
 filterWorkers(): void {

  let filtered = [...this.workers()];

  const term = this.searchTerm().trim().toLowerCase();

  if (term) {
    filtered = filtered.filter(worker =>
      worker.name?.toLowerCase().includes(term) ||
      worker.job?.toLowerCase().includes(term) ||
      worker.phone?.includes(term)
    );
  }

  if (this.filterType() !== 'all') {
    filtered = filtered.filter(worker =>
      worker.paymentType === this.filterType()
    );
  }

  this.filteredWorkers.set(filtered);
}

setFilter(type: string): void {
  this.filterType.set(type);
  this.filterWorkers();
}

clearSearch(): void {
  this.searchTerm.set('');
  this.filterWorkers();
}

// ============================================
// ✅ Helper Methods
// ============================================
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
      '#FD79A8', '#00CEC9', '#FDCB6E', '#6C5CE7'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
  // ============================================
// ✅ Form Helper
// ============================================

isTailor(worker: Worker): boolean {

  return worker.paymentType === 'tailor';

}

isPieceWorker(worker: Worker): boolean {

  return worker.paymentType === 'piece';

}


 isMonthlyWorker(): boolean {

  return this.workerForm.get('paymentType')?.value === 'monthly';

}


  // ============================================
// ✅ Save Worker
// ============================================
saveWorker(): void {
  console.log('requste add worker proccesing...')

  if (this.workerForm.invalid) {

    this.workerForm.markAllAsTouched();
    console.log('invalid request');
    return;

  }

  this.workersService.createWorker(
    this.workerForm.getRawValue() as Worker
  ).subscribe({

    next: () => {

       this.workerCreated = true;

      this.loadWorkers();

      setTimeout(() => {

        this.workerCreated = false;

        this.closeAddWorkerModal();

      }, 1500);

    },

    error: (error) => {

      console.error(error);

    }

  });

}
}
