import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyWorker } from './monthly-worker';

describe('MonthlyWorker', () => {
  let component: MonthlyWorker;
  let fixture: ComponentFixture<MonthlyWorker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyWorker],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyWorker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
