import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input,output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkerProductionService} from '../../../shared/worker-production/worker-production.service';
import { WorkTypesService, WorkType } from '../../../shared/work-types/work-types.service';
import { WorkersService } from '../../../shared/workers/workers.service';
import { Worker } from '../../../models/worker.model';
import { TransactionsService } from '../../../shared/transactions/transactions.service';
import { Transaction } from '../../../models/transaction.model';
import { WorkerProduction } from '../../../models/worker-production.model';
@Component({
  selector: 'app-tailor-worker',
  imports: [CommonModule],
  templateUrl: './tailor-worker.html',
  styleUrl: './tailor-worker.css',
})
export class TailorWorker implements OnInit {

 productionChanged = output<void>();


  private readonly workerProductionService = inject(WorkerProductionService);
  private readonly workTypesService = inject(WorkTypesService);
  private readonly workersService = inject(WorkersService);
  private readonly route = inject(ActivatedRoute);
  private readonly transactionsService = inject(TransactionsService);

  payments = input<Transaction[]>([]);

  worker = signal<Worker | null>(null);
  // ============================================
// ✅ Delete Modal
// ============================================

showDeleteModal = signal(false);

selectedProduction = signal<WorkerProduction | null>(null);



   // ============================================
    // ✅ Signals - Form
    // ============================================
  
    selectedWorkTypeId = signal<number | null>(null);
    selectedPiecePrice = signal(0);
    quantity = signal(0);
    notes = signal('');
 // ============================================
// ✅ Table View Mode
// ============================================

tableView = signal<'details' | 'summary'>('details');
// ============================================
  // ✅ Signals - Modal
  // ============================================

  showAddProductionModal = signal(false);







  // ============================================
// ✅ Load Worker Production
// ============================================

loadProduction(): void {
  const worker = this.worker();

  if (!worker?.id) return;

  this.workersService
    .getWorkerDetails(worker.id)
    .subscribe({
      next: (rows) => {
        this.production.set(rows.productions);
      },
      error: (error) => {
        console.error('Failed to load worker production:', error);
      }
    });
}

// ============================================
// ✅ Open Delete Modal
// ============================================

openDeleteModal(item: WorkerProduction): void {

    this.selectedProduction.set(item);

    this.showDeleteModal.set(true);

}

// ============================================
  // ✅ Open Add Production Modal
  // ============================================

  openAddProductionModal(): void {
    this.showAddProductionModal.set(true);
    this.editingProduction.set(null);
    
    // Reset form
    this.selectedWorkTypeId.set(null);
    this.selectedPiecePrice.set(0);
    this.quantity.set(0);

    
  }

  // ============================================
  // ✅ Close Add Production Modal
  // ============================================

  closeAddProductionModal(): void {
    this.showAddProductionModal.set(false);
    this.editingProduction.set(null);
  }
   // ============================================
  // ✅ Save Production
  // ============================================
saveProduction(): void {

  const worker = this.worker();

  const workTypeId = this.selectedWorkTypeId();

  const quantity = this.quantity();

  if (!worker?.id || !workTypeId || quantity <= 0) {

    console.warn('Invalid production data');

    return;

  }
  if (this.editingProduction()) {

    this.updateProduction();

    return;

}

  this.workerProductionService
    .addProduction({

      workerId: worker.id,

      workTypeId,

      quantity,

      productionDate: new Date()
        .toISOString()
        .substring(0, 10),

      notes: this.notes()

    })

    .subscribe({

      next: () => {

        this.closeAddProductionModal();

        this.loadProduction();

        this.productionChanged.emit();

        

      },

      error: (error) => {

        console.error(error);

      }

    });

}

  // ============================================
  // ✅ Editing Production
  // ============================================
  
  editingProduction = signal<WorkerProduction | null>(null);
  // ============================================
  // ✅ Edit Production
  // ============================================
  
  editProduction(item: WorkerProduction): void {
  
      console.log('Editing production item:', item);
  
      this.editingProduction.set(item);
  
      this.selectedWorkTypeId.set(item.workTypeId);
  
      this.selectedPiecePrice.set(item.price ?? 0);
  
      this.quantity.set(item.quantity);
  
      this.notes.set(item.notes ?? '');
  
      this.showAddProductionModal.set(true);
  
  }
  // ============================================
  // ✅ Update Production
  // ============================================
  
  updateProduction(): void {
  
      const editing = this.editingProduction();
  
      const worker = this.worker();
  
      if (!editing || !worker?.id) {
  
          return;
  
      }
  
      this.workerProductionService
  
          .updateProduction(
  
              editing.id!,
  
              {
  
                  workerId: worker.id,
  
                  workTypeId: this.selectedWorkTypeId()!,
  
                  quantity: this.quantity(),
  
                  productionDate: editing.productionDate,
  
                  notes: this.notes()
  
              } as any
  
          )
  
          .subscribe({
  
              next: () => {
  
                  this.closeAddProductionModal();
  
                  this.editingProduction.set(null);
  
                  this.loadProduction();

                  this.productionChanged.emit();
  
              },
  
              error: (error) => {
  
                  console.error(error);
  
              }
  
          });
  
  }

  // ============================================
// ✅ Confirm Delete
// ============================================

confirmDeleteProduction(): void {

    const item = this.selectedProduction();

    if (!item?.id) return;

    this.workerProductionService

        .deleteProduction(item.id)

        .subscribe({

            next: () => {

                this.closeDeleteModal();

                this.loadProduction();

                this.productionChanged.emit();

            },

            error: (error) => {

                console.error(error);

            }

        });

}
// ============================================
// ✅ Close Delete Modal
// ============================================

closeDeleteModal(): void {

    this.showDeleteModal.set(false);

    this.selectedProduction.set(null);

}
 // ============================================
// ✅ Grouped Production
// ============================================

groupedProduction = computed(() => {

    const map = new Map<number, any>();

    for (const item of this.production()) {

        if (!map.has(item.workTypeId)) {

            map.set(item.workTypeId, {

                workTypeName: item.workTypeName,

                piecePrice: item.price ?? 0,

                quantities: [],

                totalPieces: 0,

                totalAmount: 0

            });

        }

        const row = map.get(item.workTypeId);

        row.quantities.push(item.quantity);

        row.totalPieces += item.quantity;

        row.totalAmount += item.total ?? 0;

    }

    return Array.from(map.values());

});
// ============================================
// ✅ Load Work Types
// ============================================

loadWorkTypes(): void {

    this.workTypesService

        .getWorkTypes()

        .subscribe({

            next: (rows) => {

                this.workTypes.set(rows);

            },

            error: (error) => {

                console.error(error);

            }

        });

}
// ============================================
// ✅ Work Type Changed
// ============================================

onWorkTypeChange(event: Event): void {

    const id = Number(

        (event.target as HTMLSelectElement).value

    );

    this.selectedWorkTypeId.set(id);

    const workType = this.workTypes()

        .find(

            wt => wt.id === id

        );

    this.selectedPiecePrice.set(

        workType?.piecePrice ?? 0

    );

}
  


    // ============================================
// ✅ Signals - Work Types
// ============================================
 workTypes = signal<WorkType[]>([]);
  // ============================================
  // ✅ Computed
  // ============================================

  totalAmount = computed(() => {
    return this.selectedPiecePrice() * this.quantity();
  });
  // ============================================
// ✅ Production
// ============================================

  production = signal<WorkerProduction[]>([]);

  summaryGrandTotal = computed(() =>
    this.production().reduce((sum, item) => sum + (item.total ?? 0), 0)
  );

  ngOnInit(): void {
    const workerId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!workerId) return;

    this.workersService.getWorkerById(workerId).subscribe({
      next: worker => {
        this.worker.set(worker);
        this.loadProduction();
      },
      error: error => console.error(error)
    });

    this.loadWorkTypes();
  }

  onQuantityChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.quantity.set(Number.isFinite(value) ? value : 0);
  }

  onNotesChange(event: Event): void {
    this.notes.set((event.target as HTMLTextAreaElement).value);
  }


}
