import { TestBed } from '@angular/core/testing';

import { ListIdService } from './list-id.service';

describe('ListIdService', () => {
  let service: ListIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
