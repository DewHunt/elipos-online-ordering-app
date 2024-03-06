import { TestBed } from '@angular/core/testing';

import { FreeItemsService } from './free-items.service';

describe('FreeItemsService', () => {
  let service: FreeItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreeItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
