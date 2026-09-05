import { AccountCycle } from './account-cycle.model';
import { Transaction } from './transaction.model';
import { WorkerProduction } from './worker-production.model';
import { CycleBalance } from './cycle-balance.model';

export interface WorkerCycleHistory extends AccountCycle {
  productions: WorkerProduction[];
  payments: Transaction[];
  balance: CycleBalance;
}