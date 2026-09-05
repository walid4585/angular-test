import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { OrdersService } from '../../shared/orders.Service';
import { SalesOverview } from './sales-overview';

describe('SalesOverview', () => {
  let component: SalesOverview;
  let fixture: ComponentFixture<SalesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOverview],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            getAllOrders: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
