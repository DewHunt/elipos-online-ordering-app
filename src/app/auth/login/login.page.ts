import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DiscountService } from 'src/app/menu/services/discount.service';
import { CartService } from './../../cart/services/cart.service';
import { HomeService } from './../../home/services/home.service';
import { CommonService } from './../../shared/services/common.service';
import { LoaderService } from './../../shared/services/loader.service';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  shopInfo: any;
  loginData = { email: '', password: '' };
  responseData: any;
  loginMessage: string = null;
  loading: any;
  loginForm: FormGroup;
  facebookLoginDetails: any;
  googleResponseDetails: any;
  shopName: string;

  constructor(
    private formBuilder: FormBuilder,
    private authServiceProvider: AuthService,
    private router: Router,
    private loaderService: LoaderService,
    private commonService: CommonService,
    private homeService: HomeService,
    private cartService: CartService,
    private discountService: DiscountService
  ) {}

  async ngOnInit() {
    await this.loginFormInit();
    this.shopInfo = await this.homeService.getShopSettingsInfoFromLocal();
    this.shopName = this.shopInfo?.shop_name;
  }

  async loginFormInit() {
    this.loginForm = await this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  async login() {
    await this.loaderService.showLoader;
    await localStorage.setItem('userData', null);
    this.loginData = this.loginForm.value;

    await this.authServiceProvider
      .login(this.loginData)
      .subscribe(async (result) => {
        this.responseData = result;
        console.log('this.responseData: ', this.responseData);

        if (this.responseData.is_logged_in) {
          await this.authServiceProvider.setLoggedIn();
          await localStorage.setItem(
            'loginData',
            JSON.stringify(this.loginData)
          );
          await localStorage.setItem(
            'userData',
            JSON.stringify(this.responseData.data)
          );
          await this.discountService.getDiscountDataFromWeb();
          let redirectPage;
          let cartData = await this.cartService.getCart();
          if (cartData.length > 0) {
            redirectPage = 'checkout';
          } else {
            redirectPage = await localStorage.getItem('redirectPage');
            if (redirectPage === '') {
              redirectPage = 'my-account';
            }
          }
          console.log('redirectPage: ', redirectPage);
          await this.loaderService.hideLoader();
          this.router.navigate([`/${redirectPage}`], { replaceUrl: true });
        } else {
          this.loginMessage = 'Email and password combination is not matching';
          await this.loaderService.hideLoader();
          await this.commonService.showToastMessage(
            'Email and password combination is not matching',
            5000
          );
        }
      });
  }

  goSignUpPage() {
    if (!this.authServiceProvider.isLogged()) {
      this.router.navigate(['/signup'], { replaceUrl: true });
    }
  }

  goToPasswordRecoveryPage() {
    if (!this.authServiceProvider.isLogged()) {
      this.router.navigate(['/password-recovery'], { replaceUrl: true });
    }
  }
}
