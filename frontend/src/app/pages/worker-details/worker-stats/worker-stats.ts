import { Component, computed, input, signal } from '@angular/core';
import { WorkerProduction } from '../../../models/worker-production.model';
import { Worker } from '../../../models/worker.model';
import { Transaction } from '../../../models/transaction.model';

@Component({
  selector: 'app-worker-stats',
  imports: [],
  templateUrl: './worker-stats.html',
  styleUrl: './worker-stats.css',
})
export class WorkerStats {
   // ============================================
   // ✅ Worker Payments
   // ============================================
   
   payments = input<Transaction[]>([]);

   // ============================================
    // ✅ Signals - Worker
    // ============================================
  
   


    worker = input<Worker | null>();



    production = input<WorkerProduction[]>([]);

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
  // ✅ Signals - Statistics
  // ============================================


  totalEarned = input<number>(0);

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
  // ✅ Total Pieces
  // ============================================
  
  totalPieces = computed(() => {
  
      return this.groupedProduction().reduce(
  
          (sum, row) => sum + row.totalPieces,
  
          0
  
      );
  
  });







}
