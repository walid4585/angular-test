import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerStats } from './worker-stats';

describe('WorkerStats', () => {
  let component: WorkerStats;
  let fixture: ComponentFixture<WorkerStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerStats],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkerStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
