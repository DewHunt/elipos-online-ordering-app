import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from './../auth/services/auth.service';
import { CartService } from './../cart/services/cart.service';
import { CommonService } from './../shared/services/common.service';
import { LoaderService } from './../shared/services/loader.service';
import { ViewOrderComponent } from './components/view-order/view-order.component';
import { MyAccountService } from './services/my-account.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
})
export class MyAccountPage implements OnInit {
  loading: any;
  isPasswordUpdated: boolean = false;
  updatedCustomerForm: FormGroup;
  updatedPasswordForm: FormGroup;
  accountSegments: string = 'orders';
  accountInfo: any;
  allOrders: any;
  loginData: any;
  userData: any;

  constructor(
    private modalController: ModalController,
    private router: Router,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    private commonService: CommonService,
    private authServiceProvider: AuthService,
    private myAccountService: MyAccountService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getMyAccountPageReady();
    this.updateCustomerFormInit();
    this.updatedPasswordFormInit();
  }

  doRefresh(event) {
    this.getMyAccountPageReady();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async getMyAccountPageReady() {
    if (this.authServiceProvider.isLogged()) {
      localStorage.setItem('redirectPage', '');
      this.loginData = JSON.parse(localStorage.getItem('loginData'));
      this.userData = this.authServiceProvider.getUserData();
      await this.loaderService.showLoader();
      await this.myAccountService
        .getAccountDetails(this.loginData)
        .subscribe((result) => {
          this.accountInfo = result['account_info'];
          this.allOrders = result['orders'];
          console.log('this.accountInfo: ', this.accountInfo);
          console.log('this.allOrders: ', this.allOrders);

          this.loaderService.hideLoader();
        });
    } else {
      const cartData = this.cartService.getCart();
      if (cartData.length > 0) {
        localStorage.setItem('redirectPage', 'checkout');
      } else {
        localStorage.setItem('redirectPage', 'my-account');
      }
      this.router.navigate(['/login'], { replaceUrl: true });
      // this.navCtrl.setRoot('LoginPage');
    }
  }

  updateCustomerFormInit() {
    if (this.authServiceProvider.isLogged()) {
      this.updatedCustomerForm = this.formBuilder.group({
        title: [''],
        first_name: ['', [Validators.required]],
        last_name: ['', []],
        mobile: ['', [Validators.required]],
        delivery_address_line_1: [''],
        delivery_postcode: [''],
      });
    }
  }

  updatedPasswordFormInit() {
    if (this.authServiceProvider.isLogged()) {
      this.updatedPasswordForm = this.formBuilder.group(
        {
          currentPassword: ['', [Validators.required, Validators.minLength(5)]],
          newPassword: ['', [Validators.required, Validators.minLength(5)]],
          confirmPassword: ['', Validators.required],
        },
        {
          validator: this.matchPassword('newPassword', 'confirmPassword'),
        }
      );
    }
  }

  getOrderStatus(orderType) {
    let newOrderType = orderType;
    if (orderType == 'accept') {
      newOrderType = 'Accepted';
    } else if (orderType == 'reject') {
      newOrderType = 'Rejected';
    } else if (orderType == 'pending') {
      newOrderType = 'Pending';
    }
    return newOrderType;
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

  async updateCustomer() {
    let updateData = this.updatedCustomerForm.value;
    let loginData = JSON.parse(localStorage.getItem('loginData'));
    let postData = Object.assign({}, loginData, { updateData: updateData });
    let isUpdated = false;
    let message = '';
    await this.loaderService.showLoader();
    await this.myAccountService.updateCustomer(postData).subscribe((result) => {
      isUpdated = result['is_updated'];
      message = result['message'];
      this.loaderService.hideLoader();
      if (isUpdated) {
        localStorage.setItem('userData', JSON.stringify(result['customer']));
        this.commonService.showToastMessage(
          'Information successfully updated',
          5000
        );
      } else {
        this.commonService.showToastMessage('Information did not updated');
      }
    });
  }

  async deleteCustomer(customerId) {
    console.log('customerId: ', customerId);
    let loginData = JSON.parse(localStorage.getItem('loginData'));
    let postData = Object.assign({}, loginData, { customerId });
    let isDeleted = false;
    let message = '';
    await this.loaderService.showLoader();
    await this.myAccountService
      .deleteCustomer(postData)
      .subscribe(async (result) => {
        isDeleted = result['is_deleted'];
        message = result['message'];
        this.loaderService.hideLoader();
        if (isDeleted) {
          await this.authService.setLogout();
          await this.router.navigate(['/home'], { replaceUrl: true });
        }
        this.commonService.showToastMessage(message, 3000);
      });
  }

  async changePassword() {
    let updateData = this.updatedPasswordForm.value;
    let loginData = JSON.parse(localStorage.getItem('loginData'));

    let currentPassword = this.updatedPasswordForm.get('currentPassword').value;
    if (currentPassword == loginData.password) {
      let postData = Object.assign({}, loginData, { updateData: updateData });
      let isUpdated = false;
      let message = '';
      await this.loaderService.showLoader();
      await this.myAccountService
        .updatePassword(postData)
        .subscribe((result) => {
          isUpdated = result['is_updated'];
          message = result['message'];
          this.isPasswordUpdated = isUpdated;
          if (isUpdated) {
            loginData.password = updateData.newPassword;
            localStorage.setItem(
              'userData',
              JSON.stringify(result['customer'])
            );
            localStorage.setItem('loginData', JSON.stringify(loginData));
            this.loaderService.hideLoader();
            this.commonService.showToastMessage(
              'Password successfully updated',
              5000
            );
          } else {
            this.loaderService.hideLoader();
            this.commonService.showToastMessage(
              'Password did not updated',
              5000
            );
          }
          this.updatedPasswordForm.reset();
        });
    } else {
      this.updatedPasswordForm.reset();
      this.commonService.showToastMessage(
        'Your current password did not match',
        5000
      );
      // Current password not matching
    }
  }

  async viewOrder(order) {
    await this.loaderService.showLoader();
    const modal = await this.modalController.create({
      component: ViewOrderComponent,
      backdropDismiss: false,
      cssClass: 'view-order-modal',
      componentProps: { order },
    });
    await modal.present();
    await this.loaderService.hideLoader();
  }

  async reOrder(order) {
    let alert = await this.alertCtrl.create({
      header: 'Re Order',
      message: 'Are you sure to re order?',
      cssClass: 'text-center',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Yes',
          handler: () => {
            this.executeReorder(order);
          },
        },
      ],
    });
    alert.present();
  }

  async executeReorder(order) {
    let data = this.loginData;
    data.orderId = order.id;
    let cartData = null;
    await this.loaderService.showLoader();
    await this.myAccountService.reorder(data).subscribe((result) => {
      cartData = result['data'];
      console.log(cartData);
      this.loaderService.hideLoader();
    });

    if (cartData) {
      if (cartData.length > 0) {
        this.cartService.clearCart();
        for (let data of cartData) {
          this.cartService.insertForReOrder(data);
        }

        // this.navCtrl.push('CartPage', { reOrder: true });
      }
    }
  }
}
