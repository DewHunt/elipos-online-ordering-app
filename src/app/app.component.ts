import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { App } from '@capacitor/app';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element/bundle';
import { AuthService } from './auth/services/auth.service';
import { HomeService } from './home/services/home.service';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(IonRouterOutlet) outlet;
  allPages: any;
  isLoggedIn = false;
  webUrl: any;
  shopName: any;

  constructor(
    private homeService: HomeService,
    private authServiceProvider: AuthService,
    private router: Router,
    private platform: Platform,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    this.platform.backButton.subscribeWithPriority(-1, () => {
      console.log('this.router.url: ', this.router.url);
      console.log('this.outlet.canGoBack(): ', this.outlet.canGoBack());
      if (!this.outlet?.canGoBack()) {
        if (this.router.url === '/home') {
          App.exitApp();
        } else {
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      }
    });
  }

  async ngOnInit() {
    console.log('App Component: ngOnInit');
    this.webUrl = environment.webUrl;
    await this.getHomeSettings();
    await this.authServiceProvider.isLoggedIn.subscribe((res) => {
      this.isLoggedIn = res;
    });
  }

  async initializeApp() {
    console.log('app initializing ');
    // await SplashScreen.show({
    //   showDuration: 2000,
    //   autoHide: true,
    // });
    await this.platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.overlaysWebView(false);
      this.statusBar.styleLightContent();
      // await SplashScreen.hide();
    });
  }

  async getHomeSettings() {
    await this.homeService.getHomeSettingsInfo().subscribe({
      next: async (result) => {
        let homeInfo = result['data'];
        this.shopName = homeInfo.shop_name;
        await localStorage.setItem('homeInfo', JSON.stringify(homeInfo));
        await this.loadAppMenu();
      },
      error: async (error) => {
        console.log('Error: ', error);
      },
    });
  }

  async loadAppMenu() {
    this.allPages = await this.homeService.getAppsMenuFromLocal();
    await this.allPages.sort((a, b) => a.sortingNumber - b.sortingNumber);
  }

  async logout() {
    await this.authServiceProvider.setLogout();
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
