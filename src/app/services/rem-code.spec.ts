import { TestBed } from '@angular/core/testing';

import { RemCodeService } from './rem-code';

describe('RemCode', () => {
  let service: RemCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
