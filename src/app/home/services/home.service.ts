import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) {}

  getHomeSettingsInfo(): Observable<any> {
    const url = `${environment.serviceUrl}get_settings/home`;
    return this.http.get<any>(url);
  }

  getHomeSettingsInfoFromLocal() {
    return JSON.parse(localStorage.getItem('homeInfo') || '{}');
  }

  getShopSettingsInfo(): Observable<any> {
    const url = `${environment.serviceUrl}get_settings/shop_info`;
    return this.http.post<any>(url, '');
  }

  getShopSettingsInfoFromLocal() {
    return JSON.parse(localStorage.getItem('shopInfo') || '{}');
  }

  async getIsReservationAvtive() {
    const shopInfo = await this.getShopSettingsInfoFromLocal();
    if (shopInfo.other_settings.active_reservation === '1') {
      return true;
    }
    return false;
  }

  getSlidersImages(): Observable<any> {
    const url = `${environment.serviceUrl}gallery_images/slider_images`;
    return this.http.get<any>(url);
  }

  getAppBackgroundImage(): Observable<any> {
    const url = `${environment.serviceUrl}gallery_images/background_image`;
    return this.http.get<any>(url);
  }

  getAppTopImage(): Observable<any> {
    const url = `${environment.serviceUrl}gallery_images/top_image`;
    return this.http.get<any>(url);
  }

  getAppLogo(): Observable<any> {
    const url = `${environment.serviceUrl}gallery_images/logo_image`;
    return this.http.get<any>(url);
  }

  async getPromoOffersInfoFromLocal() {
    let shopInfo = await this.getShopSettingsInfoFromLocal();
    let promoOffers: any = [];
    if (shopInfo) {
      promoOffers = shopInfo.promoOffers;
    }
    return promoOffers;
  }

  saveDeviceRegistration(formData): Observable<any> {
    const saveUrl = `${environment.serviceUrl}device_registration`;
    const params = JSON.stringify(formData);
    return this.http.post<any>(saveUrl, params);
  }

  async getAppsMenuFromLocal() {
    const homeInfo = await this.getHomeSettingsInfoFromLocal();
    return homeInfo.pages;
  }

  async getPageByComponentName(componentName: string) {
    let pages = await this.getAppsMenuFromLocal();
    if (pages && pages.length > 0) {
      return pages.find((page) => page.component === componentName);
    }
    return null;
  }
}
