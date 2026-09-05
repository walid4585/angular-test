import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkTypes } from './work-types';

describe('WorkTypes', () => {
  let component: WorkTypes;
  let fixture: ComponentFixture<WorkTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
