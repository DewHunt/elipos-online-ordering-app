import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MyAccountService {
  testSubject = new Subject<any>();
  constructor(private http: HttpClient) {}

  getAccountDetails(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/get_account_details`;
    return this.http.post<any>(url, data);
  }

  reorder(data): Observable<any> {
    const url = `${environment.serviceUrl}set_order/reorder`;
    return this.http.post<any>(url, data);
  }

  updateCustomer(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/update`;
    return this.http.post<any>(url, data);
  }

  deleteCustomer(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/delete`;
    return this.http.post<any>(url, data);
  }

  updatePassword(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/update_password`;
    return this.http.post<any>(url, data);
  }
}
