import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerDetails } from './worker-details';

describe('WorkerDetails', () => {
  let component: WorkerDetails;
  let fixture: ComponentFixture<WorkerDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkerDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkerDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
