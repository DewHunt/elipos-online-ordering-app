import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  constructor(private http: HttpClient) {}

  getAllGalleryImages(): Observable<any> {
    const url = `${environment.serviceUrl}gallery_images`;
    return this.http.post<any>(url, '');
  }
}
