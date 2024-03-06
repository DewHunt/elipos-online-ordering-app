import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private http: HttpClient) {}

  getAllApprovedFeedbacks(): Observable<any> {
    const url = `${environment.serviceUrl}feedbacks/get_all_approved_feedbacks`;
    return this.http.get<any>(url);
  }

  saveFeedback(data): Observable<any> {
    const url = `${environment.serviceUrl}feedbacks/save`;
    return this.http.post<any>(url, data);
  }
}
