import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface HeadersInterface {
  [headerName: string]: string | string[];
}

@Injectable({
  providedIn: 'root',
})
export class RequestHeadersInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    const headers: HeadersInterface = {};
    let cloneRequest: any;

    // Object.assign(headers, {
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    //   'Access-Control-Allow-Headers':
    //     'Content-Type, X-Auth-Token, Origin, Authorization',
    // });
    if (token) {
      Object.assign(headers, { Authorization: `Bearer ${token}` });
    }

    if (!request.headers.has('skip')) {
      Object.assign(headers, {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      });
      cloneRequest = request.clone({ setHeaders: headers });
      return next.handle(cloneRequest);
    }
    cloneRequest = request.clone({ setHeaders: headers });
    return next.handle(cloneRequest);
  }
}
