import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  discountAmount: number = 0;
  constructor(private http: HttpClient) {}

  getCustomerCard(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/getCards`;
    return this.http.post<any>(url, data);
  }

  getVoucherDiscount(data): Observable<any> {
    const url = `${environment.serviceUrl}voucher/discount`;
    const params = new HttpParams()
      .set('couponCode', data.couponCode)
      .set('orderType', data.orderType)
      .set('totalAmount', data.totalAmount);
    console.log('credential: ', data);
    return this.http.post<any>(url, params);
  }

  getPaymentSettings(): Observable<any> {
    const url = `${environment.serviceUrl}payment`;
    return this.http.post<any>(url, '');
  }

  getDeliveryCharges(data): Observable<any> {
    const url = `${environment.serviceUrl}set_order/get_delivery_charge`;
    return this.http.post<any>(url, data);
  }

  isCustomerExist(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/login`;
    return this.http.post<any>(url, data);
  }

  stripePayment(data): Observable<any> {
    const url = `${environment.serviceUrl}payment/stripe`;
    return this.http.post<any>(url, data);
  }

  getSagepayTransactionInfo(data): Observable<any> {
    const url = `${environment.serviceUrl}sagepay_transaction/get_transaction_info`;
    return this.http.post<any>(url, data);
  }

  getCardstreamTransactionInfo(data): Observable<any> {
    const url = `${environment.serviceUrl}cardstream_transaction/get_transaction_info`;
    return this.http.post<any>(url, data);
  }

  setOrder(data): Observable<any> {
    const url = `${environment.serviceUrl}set_order`;
    return this.http.post<any>(url, data);
  }
}
