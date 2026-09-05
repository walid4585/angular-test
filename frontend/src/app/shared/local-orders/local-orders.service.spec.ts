import { TestBed } from '@angular/core/testing';

import { LocalOrdersService } from './local-orders.service';

describe('LocalOrdersService', () => {
  let service: LocalOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
