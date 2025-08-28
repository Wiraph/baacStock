import { TestBed } from '@angular/core/testing';

import { Pndfile } from './pndfile';

describe('Pndfile', () => {
  let service: Pndfile;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pndfile);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
