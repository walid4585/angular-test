import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceWorker } from './piece-worker';

describe('PieceWorker', () => {
  let component: PieceWorker;
  let fixture: ComponentFixture<PieceWorker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieceWorker],
    }).compileComponents();

    fixture = TestBed.createComponent(PieceWorker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
