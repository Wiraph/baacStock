import { TestBed } from '@angular/core/testing';

import { SignatureService } from './signature';

describe('Signature', () => {
  let service: SignatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
