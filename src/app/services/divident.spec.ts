import { TestBed } from '@angular/core/testing';

import { Divident } from './divident';

describe('Divident', () => {
  let service: Divident;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Divident);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
