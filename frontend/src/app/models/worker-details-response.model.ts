import { Worker } from './worker.model';
import { AccountCycle } from './account-cycle.model';
import { WorkerProduction} from './worker-production.model';
import { Transaction } from './transaction.model';
import { CycleBalance } from './cycle-balance.model';

export interface WorkerDetailsResponse {

  worker: Worker;

  currentCycle: AccountCycle | null;

  productions: WorkerProduction[];

  payments: Transaction[];

  balance: CycleBalance | null;

}