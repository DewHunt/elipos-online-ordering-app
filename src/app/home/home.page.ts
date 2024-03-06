import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { App } from '@capacitor/app';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import {
  AlertController,
  IonicSlides,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { AppUpdateComponent } from '../modal-page/app-update/app-update.component';
import { AuthService } from './../auth/services/auth.service';
import { CartService } from './../cart/services/cart.service';
import { DiscountService } from './../menu/services/discount.service';
import { MenuService } from './../menu/services/menu.service';
import { LoaderService } from './../shared/services/loader.service';
import { BannerComponent } from './components/banner/banner.component';
import { HomeService } from './services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  shopName: string;
  shopInfo: any;
  homePages: any;
  message: any;
  contentStyle: any;
  homeNavigationButtonStyle: any;
  animation: any;
  homeInfo: any;
  menuData: any;
  appVersion: any = { ios: 100, android: 106 };
  platformName: string = '';
  socialMediaLinks: any;
  contactNumber: string = '';
  isUpdateModalIsShow: boolean = true;
  openCloseTimeText: string = '';
  loginData = { email: '', password: '' };
  sliderImages: any[] = [];
  topImage: any;
  logoImage: any;
  appLogo: any;
  swiperModules = [IonicSlides];
  pagesForHomePage: any;
  backgroundImage: any;
  webUrl: any;

  // Design Related
  isBackgroundColorShow: boolean;
  isBackgroundImageShow: boolean;
  isTopImageShow: boolean;
  isLogoImageShow: boolean;
  isSliderShow: boolean;
  isMenuButtonShow: boolean;
  isHomeImageIconShow: boolean;
  homeIconImageSide: string;
  isChevronIcon: boolean;
  backgroundColor: string;

  constructor(
    private navCtrl: NavController,
    private callNumber: CallNumber,
    private device: Device,
    private iab: InAppBrowser,
    private router: Router,
    private platform: Platform,
    private modalController: ModalController,
    private homeService: HomeService,
    private loaderService: LoaderService,
    private alertCtrl: AlertController,
    private authServiceProvider: AuthService,
    private cartService: CartService,
    private menuService: MenuService,
    private discountService: DiscountService
  ) {}

  async ngOnInit() {
    console.log('Home Page: ngOnInit');
    await this.loaderService.showLoader();
    this.webUrl = environment.webUrl;
    await this.initializeApp();
    await this.showBannerModal();
    if (this.platformName == 'ios' || this.platformName == 'android') {
      await this.onNotificationFirebase();
    }
    await this.loaderService.hideLoader();
  }

  async doRefresh(event) {
    await this.initializeApp();

    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async initializeApp() {
    console.log('home page initializing ');
    await this.getPlatformName();
    await this.getHomeSettings();
    await this.getShopSettings();
    await this.getMenuData();
    await this.discountService.getDiscountDataFromWeb();
    await this.getSliderImages();
    await this.getAppTopImage();
    await this.getAppLogo();
  }

  async getSliderImages() {
    this.homeService.getSlidersImages().subscribe({
      next: async (results) => {
        this.sliderImages = results.images;
      },
      error: async (error) => {
        console.log('error: ', error);
      },
    });
  }

  async getAppBackgroundImage() {
    this.homeService.getAppBackgroundImage().subscribe({
      next: async (results) => {
        this.backgroundImage = results.image;
      },
      error: async (error) => {
        console.log('error: ', error);
      },
    });
  }

  async getAppTopImage() {
    this.homeService.getAppTopImage().subscribe({
      next: async (results) => {
        this.topImage = results.images;
      },
      error: async (error) => {
        console.log('error: ', error);
      },
    });
  }

  async getAppLogo() {
    this.homeService.getAppLogo().subscribe({
      next: (results) => {
        this.logoImage = results.images;
      },
      error: async (error) => {
        console.log('error: ', error);
      },
    });
  }

  async showBannerModal() {
    let promoOffers = await this.homeService.getPromoOffersInfoFromLocal();
    if (promoOffers && promoOffers.length > 0) {
      let bannerModal = await this.modalController.create({
        component: BannerComponent,
        backdropDismiss: false,
        cssClass: 'view-banner-modal',
        componentProps: { promoOffers: promoOffers },
      });
      await bannerModal.present();
    }
  }

  async openPage(page: any) {
    console.log('page: ', page);
    console.log(
      'this.authServiceProvider.isLogged(): ',
      this.authServiceProvider.isLogged()
    );
    /*
     * Reset the content nav to have just this page
     * we wouldn't want the back button to show in this scenario
     */
    if (localStorage.getItem('shopInfo')) {
      this.shopInfo = JSON.parse(localStorage.getItem('shopInfo'));
      this.shopName = this.shopInfo.shop_name;
    }
    localStorage.setItem('redirectPage', page.path);

    if (
      page.component === 'MyAccountPage' &&
      !this.authServiceProvider.isLogged()
    ) {
      const cartData = this.cartService.getCart();
      if (cartData.length > 0) {
        localStorage.setItem('redirectPage', 'checkout');
      } else {
        localStorage.setItem('redirectPage', page.path);
      }
      this.router.navigate(['/login'], { replaceUrl: true });
    } else {
      this.router.navigate([`/${page.path}`], { replaceUrl: true });
    }
  }

  async getHomeSettings() {
    await this.homeService.getHomeSettingsInfo().subscribe({
      next: async (result) => {
        await localStorage.setItem('homeInfo', null);
        await localStorage.setItem('homeInfo', JSON.stringify(result['data']));
        this.homeInfo = result['data'];
        await this.setHomeInfo();
        await this.loadAppHomeMenus();
        await this.setHomePageStyle();
        await this.checkUpdate();
      },
      error: async (error) => {
        console.log('Error: ', error);
      },
    });
  }

  async getShopSettings() {
    await this.homeService.getShopSettingsInfo().subscribe({
      next: async (result) => {
        await localStorage.setItem('shopInfo', JSON.stringify(result['data']));
        // console.log('Shop Info: ', result['data']);
        this.shopInfo = await JSON.parse(
          localStorage.getItem('shopInfo') || '{}'
        );
        this.shopName = this.shopInfo.shop_name;
      },
      error: async (error) => {
        console.log('Error: ', error);
      },
    });
  }

  async getMenuData() {
    await this.menuService.getMenuDataFromWeb(this.loginData).subscribe({
      next: async (result) => {
        this.menuData = result['data'];
        await localStorage.setItem('menuData', JSON.stringify(this.menuData));
      },
      error: async (error) => {
        console.log('Error: ', error);
      },
    });
  }

  async loadAppHomeMenus() {
    this.homePages = await this.homeService.getAppsMenuFromLocal();
    // console.log('this.homePages: ', this.homePages);
    if (this.homePages) {
      await this.homePages.sort(
        (a, b) => a.homeSortingNumber - b.homeSortingNumber
      );
      this.pagesForHomePage = await this.homePages.filter(
        (page) => page.isActive && page.showInHome
      );
    }
  }

  async setHomeInfo() {
    let homeInfo = await this.homeService.getHomeSettingsInfoFromLocal();
    if (homeInfo) {
      this.contactNumber = homeInfo.contactNumber;
      this.shopName = homeInfo.shop_name;
      this.socialMediaLinks = homeInfo.social_media_links;
      this.openCloseTimeText = homeInfo.openCloseTimeText;
    }
  }

  async setHomePageStyle() {
    let homeInfo = await this.homeService.getHomeSettingsInfoFromLocal();
    // console.log('homeInfo: ', homeInfo);
    if (homeInfo) {
      this.isBackgroundColorShow =
        homeInfo.homePageSettings.isBackgroundColorShow;
      this.isBackgroundImageShow =
        homeInfo.homePageSettings.isBackgroundImageShow;
      this.isTopImageShow = homeInfo.homePageSettings.isTopImageShow;
      this.isLogoImageShow = homeInfo.homePageSettings.isLogoImageShow;
      this.isSliderShow = homeInfo.homePageSettings.isSliderShow;
      this.isMenuButtonShow = homeInfo.homePageSettings.isMenuButtonShow;
      this.isHomeImageIconShow = homeInfo.homePageSettings.isHomeImageIconShow;
      this.homeIconImageSide = homeInfo.homePageSettings.homeIconImageSide;
      this.isChevronIcon = homeInfo.homePageSettings.isChevronIcon;
      this.backgroundColor = homeInfo.homePageSettings.backgroundColor;

      document.documentElement.style.setProperty(
        '--background-color',
        this.backgroundColor
      );
      if (this.isBackgroundImageShow) {
        await this.getAppBackgroundImage();
      }
    }
  }

  async checkUpdate() {
    let homeInfo = await this.homeService.getHomeSettingsInfoFromLocal();
    if (homeInfo) {
      if (this.platform.is('ios')) {
        let currentVersion = parseFloat(homeInfo.iosVersionNumber);
        if (currentVersion > this.appVersion.ios) {
          this.updateAppModal(homeInfo.iosUpdateMessage, homeInfo.iosUpdateUrl);
        }
      } else if (this.platform.is('android')) {
        let currentVersion = parseFloat(homeInfo.androidVersionNumber);
        if (currentVersion > parseFloat(this.appVersion.android)) {
          this.updateAppModal(
            homeInfo.androidUpdateMessage,
            homeInfo.androidUpdateUrl
          );
        }
      }
    }
  }

  async updateAppModal(message: any, updateLink: any) {
    let profileModal = await this.modalController.create({
      component: AppUpdateComponent,
      showBackdrop: true,
      backdropDismiss: false,
      cssClass: 'app-update-modal',
      componentProps: {
        updateLink: updateLink,
        updateMessage: message,
      },
    });
    profileModal.onDidDismiss().then((data: any) => {
      console.log('App Exit');
      App.exitApp();
    });
    await profileModal.present();
  }

  onNotificationFirebase() {
    let customerId = 0;
    if (this.authServiceProvider.isLogged()) {
      let userData = JSON.parse(localStorage.getItem('userData') || '{}');
      customerId = userData.id;
    }

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        console.log('Something wrong with push notifications');
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      let version = this.device.version;
      let data = {
        registration_id: token.value,
        platform: this.platformName,
        version: JSON.stringify(version),
        customer_id: customerId,
      };
      console.log('device registration data: ', data);
      this.deviceRegistration(data);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('Push received: Foreground Notification');
        if (notification) {
          const notificationAlert = await this.alertCtrl.create({
            header: 'Notification',
            subHeader: notification.data['title'],
            message: notification.data['message'],
            buttons: [
              {
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                  console.log('ok clicked');
                },
              },
              {
                text: 'See All',
                handler: () => {
                  this.router.navigateByUrl('/notification');
                },
              },
            ],
          });
          await notificationAlert.present();
        }
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Background Notification');
        console.log('Push action performed: ' + JSON.stringify(notification));
        if (notification) {
          if (notification.actionId === 'tap') {
            this.router.navigateByUrl('/notification');
          }
        }
      }
    );
  }

  async deviceRegistration(data) {
    console.log('data: ', data);
    await this.homeService.saveDeviceRegistration(data).subscribe({
      next: (result) => {
        console.log('result: ', result);
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
  }

  getPlatformName() {
    if (this.platform.is('ios')) {
      this.platformName = 'ios';
    } else if (this.platform.is('android')) {
      this.platformName = 'android';
    } else if (this.platform.is('tablet')) {
      this.platformName = 'tablet';
    } else {
      this.platformName = 'undefined';
    }
  }

  callRestaurant() {
    if (this.contactNumber) {
      this.callNumber
        .callNumber(this.contactNumber, true)
        .then((res: any) => console.log('Launched dialer!', res))
        .catch((err: any) => console.log('Error launching dialer', err));
    }
  }

  gotoContactUs() {
    this.navCtrl.navigateForward('ContactUsPage');
  }

  async showSocialMedia(name: any) {
    let link = null;
    if (name == 'facebook') {
      link = this.socialMediaLinks.facebook;
    } else if (name == 'tripadvisor') {
      link = this.socialMediaLinks.tripadvisor;
    } else if (name == 'instagram') {
      link = this.socialMediaLinks.instagram;
    } else if (name == 'googlePlus') {
      link = this.socialMediaLinks.googlePlus;
    }

    if (link) {
      const browser = this.iab.create(link, '_system', 'location=yes');
      browser.show();
      if (this.platformName == 'ios') {
      }
    }
  }
}
