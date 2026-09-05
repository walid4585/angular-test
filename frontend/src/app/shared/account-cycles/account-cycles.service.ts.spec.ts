import { TestBed } from '@angular/core/testing';

import { AccountCyclesServiceTs } from './account-cycles.service.ts';

describe('AccountCyclesServiceTs', () => {
  let service: AccountCyclesServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountCyclesServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
