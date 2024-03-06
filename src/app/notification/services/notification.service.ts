import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotificationInfo(): Observable<any> {
    const url = `${environment.serviceUrl}notification`;
    return this.http.post<any>(url, '');
  }

  getNotificationImages(): Observable<any> {
    const url = `${environment.serviceUrl}gallery_images/notification_images`;
    return this.http.get<any>(url);
  }
}
