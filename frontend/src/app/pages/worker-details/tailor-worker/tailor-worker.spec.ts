import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailorWorker } from './tailor-worker';

describe('TailorWorker', () => {
  let component: TailorWorker;
  let fixture: ComponentFixture<TailorWorker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailorWorker],
    }).compileComponents();

    fixture = TestBed.createComponent(TailorWorker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
