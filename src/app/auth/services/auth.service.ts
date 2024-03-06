import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { AlertController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // isLoggedIn: boolean = false;
  isLoggedIn = new Subject<boolean>();
  networkAlertPresent: any = null;
  isNetworkAlertPresent: boolean = false;
  constructor(
    private openNativeSettings: OpenNativeSettings,
    private http: HttpClient,
    private network: Network,
    private alertCtrl: AlertController
  ) {}

  login(credential): Observable<any> {
    const url = `${environment.serviceUrl}customers/login`;
    const params = new HttpParams()
      .set('email', credential.email)
      .set('password', credential.password);
    console.log('credential: ', credential);

    return this.http.post<any>(url, credential);
  }

  customerRegistration(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/registration`;
    return this.http.post<any>(url, data);
  }

  isEmailExists(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/is_email_exist`;
    return this.http.post<any>(url, data);
  }

  sendRecoveryCode(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/send_recovery_code`;
    return this.http.post<any>(url, data);
  }

  checkRecoveryCode(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/check_code`;
    return this.http.post<any>(url, data);
  }

  saveNewPassword(data): Observable<any> {
    const url = `${environment.serviceUrl}customers/recover_password`;
    return this.http.post<any>(url, data);
  }

  getLoginData() {
    let loginData = localStorage.getItem('loginData');
    if (loginData) {
      return JSON.parse(loginData);
    } else {
      return { email: '', password: '' };
    }
  }

  setLoggedIn() {
    this.isLoggedIn.next(true);
    localStorage.setItem('is_logged_in', JSON.stringify(true));
  }

  setLogout() {
    console.log('set logout');
    this.isLoggedIn.next(false);
    localStorage.setItem('is_logged_in', JSON.stringify(false));
    localStorage.setItem('userData', '');
  }

  isLogged(): boolean {
    const isLogged = JSON.parse(localStorage.getItem('is_logged_in'));
    this.isLoggedIn.next(isLogged);
    // console.log('isLogged: ', isLogged);
    return isLogged;
  }

  isLoginWithAuth() {
    let isLoginWithAuth = localStorage.getItem('isLoginWithAuth');
    if (isLoginWithAuth == 'true') {
      return true;
    } else {
      return false;
    }
  }

  getAccessToken() {
    let userData = this.getUserData();
    if (userData) {
      return userData.access_token;
    } else {
      return '';
    }
  }

  getUserData() {
    let userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    }
    return {};
  }

  makeFormData(data) {
    let formData = new FormData();
    for (let key in data) {
      let value = data[key];
      if (value != null) {
        formData.append(key, value);
      }
    }
    return formData;
  }

  getNetworkStatus() {
    return this.network.type;
  }

  networkOfflineAlert(type): void {
    if (type == 'none' || type == 'Offline') {
      type = 'offline';
    }
    this.networkAlertPresent = this.alertCtrl.create({
      header: 'Your network is ' + type,
      message: 'Please connect to a network',
      buttons: [
        {
          text: 'ok',
          role: 'cancel',
          handler: () => {
            console.log('ok clicked');
            this.isNetworkAlertPresent = false;
          },
        },
        {
          text: 'Settings',
          handler: () => {
            console.log('settings clicked');
            this.isNetworkAlertPresent = false;
            this.openNativeSettings.open('settings');
          },
        },
      ],
    });

    if (!this.isNetworkAlertPresent) {
      this.networkAlertPresent.present();
    }

    this.isNetworkAlertPresent = true;
  }

  networkGuard() {
    if (this.getNetworkStatus() === 'none') {
      this.networkOfflineAlert('Offline');
    } else {
      this.network.onDisconnect().subscribe(() => {
        this.networkOfflineAlert('Offline');
      });
      this.network.onConnect().subscribe(() => {
        this.networkAlertPresent.dismiss();
        this.isNetworkAlertPresent = false;
      });
    }
  }
}
