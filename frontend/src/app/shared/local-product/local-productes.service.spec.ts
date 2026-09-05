import { TestBed } from '@angular/core/testing';

import { LocalProductesService } from './local-productes.service';

describe('LocalProductesService', () => {
  let service: LocalProductesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalProductesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
