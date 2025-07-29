import { TestBed } from '@angular/core/testing';

import { JwtDecoder } from './jwt-decoder';

describe('JwtDecoder', () => {
  let service: JwtDecoder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtDecoder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
