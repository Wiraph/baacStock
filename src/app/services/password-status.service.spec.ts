import { TestBed } from '@angular/core/testing';

import { PasswordStatusService } from './password-status.service';

describe('Metadata', () => {
  let service: PasswordStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
