import { Worker } from './../../../models/worker.model';
import {
  Component,
  input,
  Input,
  output,
} from '@angular/core';



import { AccountCycle } from '../../../models/account-cycle.model';
import { DatePipe } from '@angular/common';

@Component({

  selector: 'app-monthly-worker',

  standalone: true,

  imports: [DatePipe],

  templateUrl: './monthly-worker.html',

  styleUrl: './monthly-worker.css'

})

export class MonthlyWorker {
@Input()
worker: Worker | null = null;

 @Input()
currentCycle: AccountCycle | null = null;

  startCycle = output<void>();

  onStartCycle(): void {

    this.startCycle.emit();

  }

}
