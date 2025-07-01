import { TestBed } from '@angular/core/testing';

import { AccType } from './acc-type';

describe('AccType', () => {
  let service: AccType;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccType);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
