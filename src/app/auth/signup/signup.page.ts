import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HomeService } from './../../home/services/home.service';
import { CommonService } from './../../shared/services/common.service';
import { LoaderService } from './../../shared/services/loader.service';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  pageTitle: string = 'SIGN UP';
  public registrationForm: FormGroup;
  emailValue = { email: '' };
  loginData = { email: '', password: '' };
  responseData: any;
  requestMessage: string = '';
  loading: any;
  shopInfo: any;
  shopName: string;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private formBuilder: FormBuilder,
    private homeService: HomeService,
    private authServiceProvider: AuthService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    if (this.authServiceProvider.isLogged()) {
      this.gotoMenuPage;
    }
    this.registrationInit();
    this.shopInfo = JSON.parse(localStorage.getItem('shopInfo'));
    this.shopName = this.shopInfo.shop_name;
    console.log(this.registrationForm.controls['password'].invalid);
  }

  registrationInit() {
    this.registrationForm = this.formBuilder.group(
      {
        title: [''],
        mobile: ['', [Validators.required]],
        post_code: [''],
        first_name: ['', [Validators.required]],
        last_name: [''],
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.email,
            this.isEmailExist,
          ]),
        ],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.matchPassword('password', 'confirmPassword'),
      }
    );
  }

  gotoMenuPage() {
    this.router.navigate(['/menu'], { replaceUrl: true });
  }

  gotoLoginPage() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  registration() {
    this.loaderService.showLoader();
    this.authServiceProvider
      .customerRegistration(this.registrationForm.value)
      .subscribe({
        next: (result) => {
          this.responseData = result;
          if (this.responseData.is_registered) {
            if (this.responseData.data != null) {
              this.authServiceProvider.setLoggedIn();
              localStorage.setItem(
                'userData',
                JSON.stringify(this.responseData.data)
              );
              localStorage.setItem('loginData', JSON.stringify(this.loginData));
              this.commonService.showToastMessage(this.responseData.message);
              this.loaderService.hideLoader();
              this.gotoMenuPage();
            }
          } else {
            this.commonService.showToastMessage(this.responseData.message);
            this.loaderService.hideLoader();
          }
        },
        error: (err) => {
          this.loaderService.hideLoader();
        },
      });
  }

  matchPassword(password, confirmPassword) {
    return (group: FormGroup) => {
      if (
        group.controls[password].value !== '' &&
        group.controls[confirmPassword].value !== ''
      ) {
        if (
          group.controls[password].value ===
          group.controls[confirmPassword].value
        ) {
          return { matchPassword: true };
        } else {
          return { matchPassword: false };
        }
      }
      return { matchPassword: false };
    };
  }

  isEmailExist(controles) {
    if (controles.value) {
      return null;
    } else {
      return { isEmailExist: true };
    }
    //console.log(controles.value);
  }
}
