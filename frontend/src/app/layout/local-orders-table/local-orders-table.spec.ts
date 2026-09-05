import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalOrdersTable } from './local-orders-table';

describe('LocalOrdersTable', () => {
  let component: LocalOrdersTable;
  let fixture: ComponentFixture<LocalOrdersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalOrdersTable],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalOrdersTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
