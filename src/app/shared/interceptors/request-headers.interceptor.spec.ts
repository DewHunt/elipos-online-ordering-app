import { TestBed } from '@angular/core/testing';
import { RequestHeadersInterceptor } from './request-headers.interceptor';

describe('RequestHeadersInterceptor', () => {
  let interceptor: RequestHeadersInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = TestBed.inject(RequestHeadersInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
