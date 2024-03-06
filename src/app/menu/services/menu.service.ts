import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  freeItemsOffer = new Subject<any>();
  constructor(private http: HttpClient) {}

  getMenuDataFromWeb(data): Observable<any> {
    const url = `${environment.serviceUrl}menus`;
    return this.http.post<any>(url, data);
  }

  getMenuDataFromLocal() {
    return JSON.parse(localStorage.getItem('menuData') || '{}');
  }

  getShopOpenCloseTimeList(): Observable<any> {
    const url = `${environment.serviceUrl}get_settings/get_opening_closing_time_list`;
    return this.http.post<any>(url, '');
  }
}
