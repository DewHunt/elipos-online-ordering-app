import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderService } from './../../shared/services/loader.service';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage implements OnInit {
  emailFound: boolean = false;
  recoveryCodeMatch: boolean = false;
  emailValue: string;
  recoveryCodeSubmitted: boolean = false;
  recoveryEmail: string;
  tempCode: string;
  recoveryComplete: boolean;
  recoverySuccess: boolean;
  loading: any;
  emailCheckForm: FormGroup;
  codeCheckForm: FormGroup;
  updatedPasswordForm: FormGroup;
  passwordIcon = './../../../assets/password.svg';
  shopInfo: any;
  shopName: string;

  constructor(
    private authServiceProvider: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    if (this.authServiceProvider.isLogged()) {
      this.goToMenu();
    }
    this.shopInfo = JSON.parse(localStorage.getItem('shopInfo'));
    this.shopName = this.shopInfo.shop_name;
    this.recoveryComplete = false;
    this.recoverySuccess = false;
    this.emailCheckForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.email],
        [this.asyncEmailExist.bind(this)],
      ],
    });
    console.log(this.emailCheckForm);
    this.codeCheckForm = this.formBuilder.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
    this.recoveryCodeSubmitted = false;
    this.updatedPasswordForm = this.formBuilder.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.matchPassword('newPassword', 'confirmPassword'),
      }
    );
  }

  tryAgain() {
    this.router.navigate(['/password-recovery'], { replaceUrl: true });
  }

  goToMenu() {
    this.router.navigate(['/menu'], { replaceUrl: true });
  }

  gotoLoginPage() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  matchPassword(newPassword, confirmPassword) {
    return (group: FormGroup) => {
      if (
        group.controls[newPassword].value != '' &&
        group.controls[confirmPassword].value != ''
      ) {
        if (
          group.controls[newPassword].value ===
          group.controls[confirmPassword].value
        ) {
          return { matchPassword: true };
        }
        return { matchPassword: false };
      }
      return { matchPassword: false };
    };
  }

  public asyncEmailExist(control: AbstractControl): Promise<any> {
    this.authServiceProvider.networkGuard();

    return new Promise((resolve, reject) => {
      this.authServiceProvider
        .isEmailExists(JSON.stringify({ email: control.value }))
        .subscribe({
          next: (res) => {
            console.log('res: ', res.is_email_exist);
            let is_emailExist = res.is_email_exist;
            if (is_emailExist) {
              resolve(null);
            } else {
              resolve({ isEmailExit: false });
            }
            // console.log('status= '+res.status);
          },
        });
    });
    // return promise;
  }

  sendCode() {
    this.loaderService.showLoader();
    let email = this.emailCheckForm.get('email').value;
    this.recoveryEmail = email;
    this.authServiceProvider.sendRecoveryCode({ email: email }).subscribe({
      next: (result) => {
        let responseData: any = result;
        if (responseData !== null) {
          this.emailFound = responseData.is_email_sent;
        }

        this.loaderService.hideLoader();
      },
      error: (error) => {
        this.loaderService.hideLoader();
      },
    });
  }

  checkCode() {
    this.loaderService.showLoader();
    let email: String = this.recoveryEmail;
    let code = this.codeCheckForm.get('code').value;
    this.tempCode = code;

    this.authServiceProvider
      .checkRecoveryCode({ email: email, code: code })
      .subscribe({
        next: (result) => {
          let responseData: any = result;
          if (responseData !== null) {
            this.recoveryCodeMatch = responseData.is_code_match;
          }
          this.recoveryCodeSubmitted = true;
          this.loaderService.hideLoader();
        },
        error: (error) => {
          this.loaderService.hideLoader();
        },
      });
  }

  async setNewPassword() {
    this.loaderService.showLoader();
    this.recoveryComplete = true;
    let email: String = this.recoveryEmail;
    let code: string = this.tempCode;
    let newPassword = this.updatedPasswordForm.get('newPassword').value;
    await this.authServiceProvider
      .saveNewPassword({ email: email, newPassword: newPassword, code: code })
      .subscribe({
        next: (result) => {
          let responseData: any = result;
          if (responseData != null) {
            this.recoverySuccess = responseData.is_recovered;
          }
          if (this.recoverySuccess) {
            this.authServiceProvider.setLoggedIn();
            localStorage.setItem(
              'loginData',
              JSON.stringify({ email: email, password: newPassword })
            );
            localStorage.setItem(
              'userData',
              JSON.stringify(responseData.customer)
            );
          }
          this.loaderService.hideLoader();
        },
        error: (error) => {
          this.loaderService.hideLoader();
        },
      });
  }
}
