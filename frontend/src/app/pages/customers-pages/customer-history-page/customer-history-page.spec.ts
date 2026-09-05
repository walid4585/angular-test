import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHistoryPage } from './customer-history-page';

describe('CustomerHistoryPage', () => {
  let component: CustomerHistoryPage;
  let fixture: ComponentFixture<CustomerHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerHistoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
