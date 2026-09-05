import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {WorkTypesService} from '../../shared/work-types/work-types.service'
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';

// ============================================
// ✅ Interfaces (optional, for type safety)
// ============================================

export interface WorkType {

    id?: number;

    name: string;

    piecePrice: number;

    active?: number;

    createdAt?: string;

}

// ============================================
// ✅ Component
// ============================================

@Component({
  selector: 'app-work-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-types.html',
  styleUrls: ['./work-types.css']
})
export class WorkTypes implements OnInit {
  private readonly layout = inject(DashboardLayoutService);
  // ============================================
  // ✅ Signals (State)
  // ============================================

  loading = signal<boolean>(false);
  workTypes = signal<WorkType[]>([]);
  modalOpen = signal<boolean>(false);
  editingItem = signal<WorkType | null>(null);
  filterActive = signal<boolean>(true);
  searchTerm = signal<string>('');

  formData: Omit<WorkType, 'id'> = {

    name: '',

    piecePrice: 0,

    active: 1

};
// ============================================
// ✅ Services
// ============================================

private readonly workTypesService = inject(WorkTypesService);

  // ============================================
  // ✅ Computed Signals
  // ============================================

  filteredWorkTypes = computed(() => {
    // TODO: implement filtering logic
    return this.workTypes();
  });

  activeCount = computed(() => {
    // TODO: return count of active work types
    return this.workTypes().filter(w => w.active).length; 
  });

  inactiveCount = computed(() => {
    // TODO: return count of inactive work types
    return this.workTypes().filter(w => !w.active).length;
  });

  // ============================================
  // ✅ Lifecycle
  // ============================================

  ngOnInit(): void {
    this.layout.setPageTitle(' Work Type');
    this.loadWorkTypes();
  }

  // ============================================
  // ✅ Data Loading
  // ============================================

  loadWorkTypes(): void {
               this.loading.set(true);

    this.workTypesService

        .getWorkTypes()

        .subscribe({

            next: (data) => {

                this.workTypes.set(data);

                this.loading.set(false);

            },

            error: (error) => {

                console.error(error);

                this.loading.set(false);

            }

        });

  }

  refresh(): void {
    this.loadWorkTypes();
  }

  // ============================================
  // ✅ Modal Controls
  // ============================================

  openAddModal(): void {
                this.resetForm();

                this.editingItem.set(null);

                this.modalOpen.set(true);
  }

  openEditModal(item: WorkType): void {

    this.editingItem.set(item);

    this.fillForm(item);

    this.modalOpen.set(true);

}

  closeModal(): void {
                    this.modalOpen.set(false);

                 this.resetForm();

                 this.editingItem.set(null);
  }

  // ============================================
  // ✅ Form Helpers
  // ============================================

  resetForm(): void {
    this.formData = {

        name: '',

        piecePrice: 0,

        active: 1

    };

  }

  fillForm(item: WorkType): void {

    this.formData = {

        name: item.name,

        piecePrice: item.piecePrice,

        active: item.active ?? 1

    };

}

  validateForm(): boolean {

    if (!this.formData.name.trim()) {

        return false;

    }

    if (this.formData.piecePrice < 0) {

        return false;

    }

    return true;

}

  // ============================================
  // ✅ Save (Create / Update)
  // ============================================

  save(): void {

    if (!this.validateForm()) {

        return;

    }

    if (this.editingItem()) {

        this.updateWorkType();

    } else {

        this.createWorkType();

    }

}

  createWorkType(): void {
    this.workTypesService

        .createWorkType(this.formData)

        .subscribe({

            next: () => {

                this.closeModal();

                this.refresh();

            },

            error: (error) => {

                console.error(error);

            }

        });

  }

  updateWorkType(): void {

    const item = this.editingItem();

    if (!item?.id) {

        return;

    }

    this.workTypesService

        .updateWorkType(

            item.id,

            this.formData

        )

        .subscribe({

            next: () => {

                this.closeModal();

                this.refresh();

            },

            error: (error) => {

                console.error(error);

            }

        });

}

  // ============================================
  // ✅ Delete
  // ============================================

  deleteWorkType(id: number): void {
    // TODO: delete work type by id
  }
}