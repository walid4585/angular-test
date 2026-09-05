import { Component, OnInit,inject, signal,computed} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '../../../models/worker.model';
import { WorkerCycleHistory } from '../../../models/worker-cycle-history.model';
import { CommonModule } from '@angular/common';
import { WorkersService } from '../../../shared/workers/workers.service';

@Component({
    selector: 'app-worker-history',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './worker-history.html',
    styleUrl: './worker-history.css'
})
export class WorkerHistoryComponent implements OnInit {

    // ============================================
    // ✅ Services
    // ============================================

    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly workersService = inject(WorkersService);


    // ============================================
    // ✅ Worker
    // ============================================

    worker = signal<Worker | null>(null);


    // ============================================
    // ✅ Cycles
    // ============================================

    cycles = signal<WorkerCycleHistory[]>([]);


    // ============================================
    // ✅ UI State
    // ============================================

    loading = signal(false);

    error = signal<string | null>(null);


    // ============================================
    // ✅ Expanded Cycle
    // ============================================

    expandedCycleId = signal<number | null>(null);


    // ============================================
    // ✅ Statistics
    // ============================================

    totalCycles = computed(() => {

        return this.cycles().length;

    });


    // ============================================
    // ✅ Total Pieces
    // ============================================

    totalPieces = computed(() => {

        return this.cycles().reduce(
            (total, cycle) => {

                return total +
                    cycle.productions.reduce(
                        (sum, production) =>
                            sum + production.quantity,
                        0
                    );

            },
            0
        );

    });


    // ============================================
    // ✅ Total Earned / Salary
    // ============================================

    totalEarned = computed(() => {

        return this.cycles().reduce(
            (total, cycle) =>
                total +
                (cycle.balance.totalProduction ?? 0),
            0
        );

    });


    // ============================================
    // ✅ Total Paid
    // ============================================

    totalPaid = computed(() => {

        return this.cycles().reduce(
            (total, cycle) =>
                total +
                cycle.balance.totalPayments,
            0
        );

    });


    // ============================================
    // ✅ Total Remaining
    // ============================================

    totalRemaining = computed(() => {

        return this.cycles().reduce(
            (total, cycle) =>
                total +
                cycle.balance.remaining,
            0
        );

    });


    // ============================================
    // ✅ Worker Type
    // ============================================

    isPieceWorker = computed(() => {

        return this.worker()?.paymentType === 'piece';

    });


    isTailorWorker = computed(() => {

        return this.worker()?.paymentType === 'tailor';

    });


    isMonthlyWorker = computed(() => {

        return this.worker()?.paymentType === 'monthly';

    });


    // ============================================
    // ✅ Initialize
    // ============================================

    ngOnInit(): void {

        const workerId = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!workerId) {

            this.error.set('Invalid worker ID.');

            return;

        }

        this.loadWorker(workerId);

        this.loadWorkerCycles(workerId);

    }


    // ============================================
    // ✅ Load Worker
    // ============================================

    loadWorker(workerId: number): void {

        this.workersService
            .getWorkerById(workerId)
            .subscribe({

                next: (worker) => {

                    this.worker.set(worker);

                },

                error: (err) => {

                    console.error(
                        'Failed to load worker:',
                        err
                    );

                    this.error.set(
                        'Failed to load worker.'
                    );

                }

            });

    }


    // ============================================
    // ✅ Load Worker Cycles
    // ============================================

    loadWorkerCycles(workerId: number): void {

        this.loading.set(true);

        this.error.set(null);

        this.workersService
            .getWorkerCyclesHistory(workerId)
            .subscribe({

                next: (cycles) => {

                    this.cycles.set(cycles);

                    this.loading.set(false);

                },

                error: (err) => {

                    console.error(
                        'Failed to load worker cycles:',
                        err
                    );

                    this.error.set(
                        'Failed to load worker cycle history.'
                    );

                    this.loading.set(false);

                }

            });

    }


    // ============================================
    // ✅ Toggle Cycle
    // ============================================

    toggleCycle(cycleId: number): void {

        if (this.expandedCycleId() === cycleId) {

            this.expandedCycleId.set(null);

        } else {

            this.expandedCycleId.set(cycleId);

        }

    }


    // ============================================
    // ✅ Check Expanded
    // ============================================

    isCycleExpanded(cycleId: number): boolean {

        return this.expandedCycleId() === cycleId;

    }


  
  // ============================================
  // ✅ Go Back
  // ============================================
  goBack(): void {
    history.back();
  }

  // ============================================
  // ✅ Print Cycle
  // ============================================
  printCycle(cycle: WorkerCycleHistory): void {
    console.log('Printing cycle:', cycle);

    window.print();
}
// ============================================
// ✅ Share Cycle
// ============================================

async shareCycle(cycle: WorkerCycleHistory): Promise<void> {

    const workerName = this.worker()?.name ?? 'Worker';

    const text = `
Worker: ${workerName}
Cycle #${cycle.id}

Total: ${cycle.balance.totalProduction ?? 0} DA
Paid: ${cycle.balance.totalPayments} DA
Remaining: ${cycle.balance.remaining} DA
    `.trim();

    if (navigator.share) {

        try {
            await navigator.share({
                title: `Worker Cycle #${cycle.id}`,
                text
            });

        } catch (error) {
            console.log('Share cancelled:', error);
        }

    } else {

        await navigator.clipboard.writeText(text);

        alert('Cycle information copied to clipboard.');

    }
}


}