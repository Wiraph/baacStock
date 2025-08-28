import { TestBed } from '@angular/core/testing';

import { Pnd } from './pnd';

describe('Pnd', () => {
  let service: Pnd;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pnd);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
