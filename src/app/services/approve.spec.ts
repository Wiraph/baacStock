import { TestBed } from '@angular/core/testing';

import { Approve } from './approve';

describe('Approve', () => {
  let service: Approve;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Approve);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
