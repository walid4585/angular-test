import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerHistory } from './worker-history';

describe('WorkerHistory', () => {
  let component: WorkerHistory;
  let fixture: ComponentFixture<WorkerHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkerHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
