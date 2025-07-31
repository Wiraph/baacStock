import { TestBed } from '@angular/core/testing';

import { Spin } from './spin';

describe('Spin', () => {
  let service: Spin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Spin);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
