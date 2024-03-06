import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  InAppBrowser,
  InAppBrowserEvent,
} from '@awesome-cordova-plugins/in-app-browser/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { AuthService } from './../auth/services/auth.service';
import { CartService } from './../cart/services/cart.service';
import { HomeService } from './../home/services/home.service';
import { DiscountService } from './../menu/services/discount.service';
import { MyAccountService } from './../my-account/services/my-account.service';
import { ProductPricePipe } from './../shared/pipes/product-price.pipe';
import { CommonService } from './../shared/services/common.service';
import { LoaderService } from './../shared/services/loader.service';
import { OrderSubmitMessageComponent } from './components/order-submit-message/order-submit-message.component';
import { TipsComponent } from './components/tips/tips.component';
import { CheckoutService } from './services/checkout.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };
  pageTitle: string = 'Checkout';
  payPalEnvironmentProduction: string = '';
  payPalEnvironmentSandbox: string = '';
  payPalEnvironment: string = 'live';
  stripePublishAbleKey: string = '';
  payPalCurrency: string = '';
  deliveryCharge: number = 0;
  userData: any;
  loginData: any;
  loading: any;
  cartData: any = [];
  orderType: string;
  cardPaymentResponse: any;
  shopInfo: any;
  order_type: string = 'collection';
  shopOrderType = 'collection';
  isShopIsClosed: boolean = false;
  todayShopTiming: any;
  deliveryAndCollectionTimingOptions: any = [];
  settingsOrderType: string;
  settingsPaymentMethod: string;
  settingsPaymentGateway: any;
  cardFree: any = 0;
  isOrderSubmitted: boolean = false;
  isOrderSuccess: boolean = false;
  deliveryPostCodeAlertText: string;
  validPostCode: boolean = false;
  monthsName = [
    { key: 1, value: 'January' },
    { key: 2, value: 'February' },
    { key: 3, value: 'March' },
    { key: 4, value: 'April' },
    { key: 5, value: 'May' },
    { key: 6, value: 'June' },
    { key: 7, value: 'July' },
    { key: 8, value: 'August' },
    { key: 9, value: 'September' },
    { key: 10, value: 'October' },
    { key: 11, value: 'November' },
    { key: 12, value: 'December' },
  ];
  years = [];
  orderForm: FormGroup;
  postCodeResponse: any;
  submitOrderResponse: any;
  minimumDeliveryOrderAmount: any = 0;
  discountAmount: number = 0;
  submitted: boolean = false;
  showDeliveryDetailsBlock: Boolean = false;
  orderTypeTimeSelectionText: string = 'Delivery Or Collection time';
  paymentSystemLabel: any;
  isCouponEnabled = false;
  couponCodeText: string = '';
  couponDiscount: number = 0;
  cartTotal: number = 0;
  cartTotalBuyGetAmount: number = 0;
  serviceCharge: number = 0;
  packagingCharge: number = 0;
  serviceChargeInfo: any;
  packagingChargeInfo: any;
  couponId = 0;
  transactionId = 0;
  tableNumber = 0;
  surcharge = 0;
  tipsStatusForCard = 'no';
  tipsStatusForCash = 'no';
  tipsData: any;
  tipsAmount = 0;
  processStatus = true;

  constructor(
    private platform: Platform,
    private router: Router,
    private formBuilder: FormBuilder,
    private element: ElementRef,
    private renderer: Renderer2,
    private modalController: ModalController,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private alertCtrl: AlertController,
    private stripeService: StripeService,
    private authServiceProvider: AuthService,
    private myAccountService: MyAccountService,
    private discountService: DiscountService,
    private loaderService: LoaderService,
    private homeService: HomeService,
    private commonService: CommonService,
    private productPricePipe: ProductPricePipe,
    private inAppBrowser: InAppBrowser
  ) {}

  async ngOnInit() {
    await this.getCheckoutPageReady();
  }

  async ionViewDidEnter() {
    if (this.cartData.length > 0) {
      await this.loaderService.showLoader();
    }
    let orderType = await this.discountService.getOrderType();
    if (orderType) {
      this.order_type = orderType;
    }
    this.settingsOrderType = this.order_type;
    await this.getUserData();
    await this.getShopInfo();
    if (this.cartData.length > 0) {
      await this.loaderService.hideLoader();
    }
  }

  async doRefresh(event) {
    await this.getCheckoutPageReady();

    setTimeout(async () => {
      await this.getShopInfo();
      event.target.complete();
    }, 2000);
  }

  async getCheckoutPageReady() {
    // logout if cart is empty
    this.loginData = await JSON.parse(localStorage.getItem('loginData'));
    await this.checkoutService.isCustomerExist(this.loginData).subscribe({
      next: async (result) => {
        console.log('result: ', result);
        if (result) {
          console.log('result: ', result.is_logged_in);
          if (result.is_logged_in === false) {
            await this.authServiceProvider.setLogout();
            await localStorage.setItem('redirectPage', 'checkout');
            this.router.navigate(['/login'], { replaceUrl: true });
          } else {
            await localStorage.setItem('redirectPage', '');
          }
        } else {
          await localStorage.setItem('redirectPage', '');
        }
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
    // logout if cart is empty

    this.cartData = await this.cartService.getCart();
    if (this.cartData.length <= 0) {
      this.router.navigate(['/menu'], { replaceUrl: true });
    }
    this.cartTotal = await this.cartService.getTotalAmount();
    this.cartTotalBuyGetAmount = await this.cartService.getTotalBuyGetAmout();
    this.userData = await JSON.parse(localStorage.getItem('userData'));
    this.shopInfo = await JSON.parse(localStorage.getItem('shopInfo'));
    this.paymentSystemLabel = this.shopInfo.paymentSystemLabel;

    let date = new Date();
    let currentYear = date.getFullYear();
    this.years.push(currentYear);
    for (let i = 1; i <= 11; i++) {
      this.years.push(currentYear + i);
    }

    let orderType = await this.discountService.getOrderType();
    if (orderType) {
      this.order_type = orderType;
    }

    await this.checkoutFormInit();
    await this.getPaymentSettings();
  }

  closeModal() {
    this.router.navigate(['/cart'], { replaceUrl: true });
  }

  checkoutFormInit() {
    this.orderForm = this.formBuilder.group({
      name: [
        this.getFullName(
          this.userData.title,
          this.userData.first_name,
          this.userData.last_name
        ),
        [],
      ],
      mobile: [this.userData.mobile, [Validators.required]],
      delivery_address_line_1: [this.userData.delivery_address_line_1],
      payment_method: [, [Validators.required]],
      order_type: ['', [Validators.required]],
      notes: [],
      delivery_time: [, [Validators.required]],
      delivery_postcode: [
        this.userData.delivery_postcode,
        [],
        [this.asyncValidationPostcode.bind(this)],
      ],
    });

    this.orderForm.get('order_type').setValue(this.order_type);
    this.orderForm.get('order_type').updateValueAndValidity();
    this.showDiscountMessage();

    this.orderForm.get('order_type').valueChanges.subscribe((order_type) => {
      if (order_type == 'delivery') {
        this.showDeliveryDetailsBlock = false;
        this.orderTypeTimeSelectionText = 'Delivery Time';
        this.orderForm
          .get('delivery_address_line_1')
          .setValidators([Validators.required]);
        this.deliveryPostCodeAlertText = 'Delivery postcode is required';
        this.orderForm
          .get('delivery_postcode')
          .setValidators([Validators.required]);
        /* this.orderForm.controls['delivery_postcode'].setErrors({'incorrect':true});*/
      } else {
        if (order_type == 'collection') {
          this.orderTypeTimeSelectionText = 'Collection Time';
        } else {
          this.orderTypeTimeSelectionText = 'Delivery Or Collection Time';
        }
        this.showDeliveryDetailsBlock = true;
        this.orderForm.get('delivery_address_line_1').setValidators([]);
        this.orderForm.get('delivery_postcode').setValidators([]);
      }
      this.orderForm.get('delivery_address_line_1').updateValueAndValidity();
      this.orderForm.get('delivery_postcode').updateValueAndValidity();
      this.orderForm.get('delivery_time').setValue('');
      this.orderForm.get('delivery_time').updateValueAndValidity();
    });
  }

  async getUserData() {
    await this.myAccountService.getAccountDetails(this.loginData).subscribe({
      next: async (result) => {
        this.userData = result['account_info'];
        await localStorage.setItem(
          'userData',
          JSON.stringify(result['account_info'])
        );
      },
    });
  }

  async getShopInfo() {
    await this.homeService.getShopSettingsInfo().subscribe({
      next: (result) => {
        localStorage.setItem('shopInfo', JSON.stringify(result['data']));
        this.shopInfo = result['data'];
        this.shopOrderType = this.shopInfo.order_settings.order_type;
        this.serviceChargeInfo = this.shopInfo.service_charge;
        this.packagingChargeInfo = this.shopInfo.packaging_charge;
        this.isShopIsClosed = this.shopInfo.is_shop_closed;
        this.isCouponEnabled = this.shopInfo.isCouponEnabled;
        this.todayShopTiming = this.shopInfo.shop_timings;
        let payment = this.shopInfo.payment_gateway;
        this.paymentSystemLabel = this.shopInfo.paymentSystemLabel;
        let payPal = payment.paypal;
        this.payPalCurrency = payPal.currency;
        this.payPalEnvironmentProduction = payPal.production_client_id;
        this.payPalEnvironmentSandbox = payPal.sandbox_client_id;
        this.payPalEnvironment = payPal.environment;
        if (this.order_type == 'collection') {
          this.deliveryAndCollectionTimingOptions = this.shopInfo
            ? this.shopInfo.collection_time_options
            : [];
        } else if (this.order_type == 'delivery') {
          this.deliveryAndCollectionTimingOptions = this.shopInfo
            ? this.shopInfo.delivery_time_options
            : [];
        }
        let stripe = payment.stripe;
        this.stripePublishAbleKey = stripe.publishable_key;
        this.tipsStatusForCard = this.shopInfo.tips.tips_for_card;
        this.tipsStatusForCash = this.shopInfo.tips.tips_for_cash;
        this.tipsData = this.shopInfo.tips.tips_data;
      },
      error: (error) => {},
    });
  }

  removeCouponCode() {
    this.couponCodeText = '';
    this.couponDiscount = 0;
  }

  async addCouponCode(couponCodeText) {
    this.couponCodeText = couponCodeText;
    console.log('this.couponCodeText: ', this.couponCodeText);

    const data = {
      couponCode: couponCodeText,
      orderType: this.orderForm.get('order_type').value,
      totalAmount: this.cartTotal - this.cartTotalBuyGetAmount,
    };
    console.log('data: ', data);

    await this.checkoutService.getVoucherDiscount(data).subscribe({
      next: async (result: any) => {
        console.log('result: ', result);
        if (result.isValid) {
          this.couponId = result.couponId;
          this.couponCodeText = couponCodeText;
          this.couponDiscount = result.discount;
        } else {
          this.couponDiscount = 0;
        }
        await this.commonService.showToastMessage(result.message, 3000);
      },
      error: (error) => {
        console.log('error', error);
      },
    });

    return false;
  }

  getPaymentSystemLabel(key) {
    if (!this.paymentSystemLabel) {
      return key;
    }
    if (key === 'Cash' && this.paymentSystemLabel.hasOwnProperty('cash')) {
      return this.paymentSystemLabel.cash;
    }
    if (key === 'Paypal' && this.paymentSystemLabel.hasOwnProperty('paypal')) {
      return this.paymentSystemLabel.paypal;
    }
    if (key === 'Stripe' && this.paymentSystemLabel.hasOwnProperty('stripe')) {
      return this.paymentSystemLabel.stripe;
    }
    if (
      key === 'Sagepay' &&
      this.paymentSystemLabel.hasOwnProperty('sagepay')
    ) {
      return this.paymentSystemLabel.sagepay;
    }
    return key;
  }

  toogleByClassName(className) {
    let classElement =
      this.element.nativeElement.getElementsByClassName(className)[0];
    if (classElement.style.display == 'none') {
      this.renderer.setStyle(classElement, 'display', 'block');
    } else {
      this.renderer.setStyle(classElement, 'display', 'none');
    }
  }

  async getPaymentSettings() {
    await this.checkoutService.getPaymentSettings().subscribe({
      next: (result) => {
        // console.log(result['data']);
        if (result['data']) {
          let data = result['data'];
          this.settingsOrderType = data.order_type;
          this.settingsPaymentMethod = data.payment_method;
          this.settingsPaymentGateway = data.payment_gateway;
          this.cardFree = data.surcharge;
          if (
            this.settingsOrderType == 'delivery_and_collection' ||
            this.settingsOrderType == 'collection'
          ) {
            // this.orderForm.get('order_type').setValue('collection');
            // this.orderForm.get('order_type').updateValueAndValidity();
            if (this.settingsOrderType == 'collection') {
              this.orderTypeTimeSelectionText = 'Collection Time';
              if (this.deliveryAndCollectionTimingOptions.length == 0) {
                this.orderTypeTimeSelectionText =
                  'Collection time is not available at this moment';
              }
            }
          } else if (this.settingsOrderType == 'delivery') {
            this.orderTypeTimeSelectionText = 'Delivery time';

            if (this.deliveryAndCollectionTimingOptions.length == 0) {
              this.orderTypeTimeSelectionText =
                'Delivery time is not available at this moment';
            }
            // this.orderForm.get('order_type').setValue('delivery');
            // this.orderForm.get('order_type').updateValueAndValidity();
          }

          if (
            this.settingsPaymentMethod == 'both' ||
            this.settingsPaymentMethod == 'cash'
          ) {
            this.orderForm.get('payment_method').setValue('cash');
            this.orderForm.get('payment_method').updateValueAndValidity();
          }
        }
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
  }

  public asyncValidationPostcode(control: AbstractControl): Promise<any> {
    const promise = new Promise(async (resolve, reject) => {
      let orderType = this.orderForm?.get('order_type')?.value;
      this.deliveryPostCodeAlertText = 'Checking...';
      if (orderType == 'delivery') {
        if (control.value !== '' || control.value !== null) {
          const data = await JSON.stringify({
            delivery_postcode: control.value,
          });
          await this.checkoutService.getDeliveryCharges(data).subscribe({
            next: (result) => {
              let message = '';
              let validPostCode = false;
              this.postCodeResponse = result;
              if (this.postCodeResponse != null) {
                validPostCode = this.postCodeResponse.is_valid_postcode;
                message = this.postCodeResponse.message;
              } else {
                message = 'Delivery postcode is invalid';
              }
              if (validPostCode) {
                resolve(null);
              } else {
                this.deliveryPostCodeAlertText = message;
                resolve({ invalidPostcode: true });
              }
              // console.log('status= '+res.status);
            },
            error: (error) => {
              console.log('error: ', error);
            },
          });
        } else {
          this.deliveryPostCodeAlertText = 'Delivery postcode is required';
          // console.log(this.deliveryPostCodeAlertText);
          resolve({ emptyPostcode: true });
        }
      } else {
        this.deliveryPostCodeAlertText = '';
        resolve(null);
      }
    });

    return promise;
  }

  validatePostCode(order_type: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      // console.log(order_type);

      if (control.value === '') {
        this.deliveryPostCodeAlertText = 'Delivery postcode required';
        return { deliveryPostCodeEmpty: true };
      } else {
        let isValid = false;
        this.checkoutService
          .getDeliveryCharges({ delivery_postcode: control.value })
          .subscribe({
            next: (result) => {
              this.postCodeResponse = result;
              if (this.postCodeResponse != null) {
                this.validPostCode = this.postCodeResponse.is_valid_postcode;
              }
            },
            error: (error) => {},
          });

        if (this.validPostCode) {
          return null;
        } else {
          this.deliveryPostCodeAlertText = 'Delivery postcode is invalid';
          return { invalidPostCode: true };
        }
      }
    };
  }

  isValidPostCode(postCode: string): boolean {
    if (postCode !== '') {
      this.checkoutService
        .getDeliveryCharges({ delivery_postcode: postCode })
        .subscribe({
          next: (result) => {
            this.postCodeResponse = result;
          },
          error: (error) => {},
        });
      // console.log(this.postCodeResponse);
      if (this.postCodeResponse != null) {
        let isValidPosCode = this.postCodeResponse.is_valid_postcode;

        this.validPostCode = isValidPosCode;
      }
      return this.validPostCode;
    } else {
      return false;
    }
  }

  setPostCodeValidators(group): any {
    let isValidPosCode = false;
    let delivery_postcode_value = group.controls['delivery_postcode'].value;
    if (group.controls['order_type'].value === 'delivery') {
      /*  group.controls['delivery_postcode'].setValue(1245);*/
      if (delivery_postcode_value !== '') {
        return this.checkoutService
          .getDeliveryCharges({ delivery_postcode: delivery_postcode_value })
          .subscribe({
            next: (result) => {
              this.postCodeResponse = result;
              if (this.postCodeResponse != null) {
                isValidPosCode = this.postCodeResponse.is_valid_postcode;
                // console.log(isValidPosCode);
                if (isValidPosCode) {
                  this.deliveryPostCodeAlertText = 'Valid postcode';
                  return null;
                }
                this.deliveryPostCodeAlertText =
                  'Delivery post code is not valid';
                return { validPostCode: true };
              }
            },
            error: (error) => {
              return null;
            },
          });
      }
      this.deliveryPostCodeAlertText = 'Delivery postcode is required';
      return { validPostCode: true };
    }
    this.deliveryPostCodeAlertText = '';
    return null;
  }

  async isAnyTipsActive() {
    let count = 0;
    await this.tipsData.forEach((tips) => {
      if (parseInt(tips.status) === 1) {
        count++;
      }
    });
    if (count > 0) {
      return true;
    }
    return false;
  }

  async showTipsModal() {
    let payment_method = this.orderForm.get('payment_method').value;
    let isActive = await this.isAnyTipsActive();

    let tipsModalStatus = 'no';
    if (payment_method === 'cash') {
      tipsModalStatus = this.tipsStatusForCash;
    } else {
      tipsModalStatus = this.tipsStatusForCard;
    }

    if (tipsModalStatus === 'yes' && isActive === true) {
      await this.loaderService.showLoader();
      const tipsModal = await this.modalController.create({
        component: TipsComponent,
        backdropDismiss: false,
        cssClass: 'tips-modal',
        componentProps: { tipsData: this.tipsData },
      });
      tipsModal.onDidDismiss().then((dismissData) => {
        const { data, role } = dismissData;
        this.processStatus = data.processStatus;
        this.tipsAmount = data.tipsAmount;
        this.submitOrder();
      });
      await tipsModal.present();
      await this.loaderService.hideLoader();
    } else {
      await this.submitOrder();
    }
  }

  async getPlatformName() {
    if (this.platform.is('ios')) {
      return 'ios';
    } else if (this.platform.is('android')) {
      return 'android';
    }
    return 'undefined';
  }

  async submitOrder() {
    console.log('this.orderForm: ', this.orderForm);
    console.log('this.processStatus: ', this.processStatus);
    if (this.processStatus) {
      await this.loaderService.showLoader();
      let payment_method = this.orderForm.get('payment_method').value;
      let order_type = this.orderForm.get('order_type').value;
      let mobile = this.orderForm.get('mobile').value;
      let delivery_postcode = this.orderForm.get('delivery_postcode').value;
      let delivery_address_line_1 = this.orderForm.get(
        'delivery_address_line_1'
      ).value;
      let delivery_time = this.orderForm.get('delivery_time').value;
      let notes = this.orderForm.get('notes').value;

      this.orderType = order_type;
      this.submitted = true;
      let cart_data = await this.cartService.getCart();
      this.cartData = cart_data;
      this.cartService.discountAmount = 0;
      // await this.discountService.getDiscountDataFromWeb();
      this.discountAmount = 0;
      let cart_total: number = await this.cartService.getTotalAmount();

      this.cartTotalBuyGetAmount = await Math.abs(
        this.cartService.getTotalBuyGetAmout()
      );
      this.serviceCharge = await Math.abs(
        this.cartService.getServiceCharge(this.serviceChargeInfo, order_type)
      );
      this.packagingCharge = await Math.abs(
        this.cartService.getPackagingCharge(
          this.packagingChargeInfo,
          order_type
        )
      );

      const discountInfo = await this.discountService.getDiscount(order_type);
      this.discountAmount = Math.abs(discountInfo.amount);
      this.couponDiscount = Math.abs(this.couponDiscount);

      let isPreOrder = this.isShopIsClosed;
      let postData = {
        platform: await this.getPlatformName(),
        email: this.loginData.email,
        password: this.loginData.password,
        cart_data: cart_data,
        order_type: order_type,
        delivery_charge: this.deliveryCharge,
        payment_method: payment_method,
        mobile: mobile,
        delivery_time: delivery_time,
        delivery_postcode: delivery_postcode,
        delivery_address_line_1: delivery_address_line_1,
        cart_total: Math.abs(cart_total),
        notes: notes,
        is_pre_order: isPreOrder,
        surcharge: this.surcharge,
        discount: this.discountAmount,
        couponId: this.couponId,
        couponCode: this.couponCodeText,
        couponDiscount: this.couponDiscount,
        totalBuyGetAmount: this.cartTotalBuyGetAmount,
        serviceCharge: this.serviceCharge,
        packagingCharge: this.packagingCharge,
        transactionId: this.transactionId,
        tableNumber: this.tableNumber,
        tipsAmount: this.tipsAmount,
      };

      let isValidPosCode = false;

      if (order_type == 'delivery') {
        await this.checkoutService
          .getDeliveryCharges({ delivery_postcode: delivery_postcode })
          .subscribe({
            next: (result) => {
              this.postCodeResponse = result;
            },
            error: (error) => {},
          });

        if (this.postCodeResponse != null) {
          isValidPosCode = this.postCodeResponse.is_valid_postcode;
          this.deliveryCharge = parseFloat(
            this.postCodeResponse.delivery_charge
          );
          this.minimumDeliveryOrderAmount = parseFloat(
            this.postCodeResponse.minimum_delivery_order
          );

          // update delivery charge
          postData.delivery_charge = this.deliveryCharge;
          if (this.minimumDeliveryOrderAmount > postData.cart_total) {
            await this.minimumDeliveryOrderAmountAlert(
              this.minimumDeliveryOrderAmount
            );
            console.log(
              'this.postCodeResponse not null: ',
              this.postCodeResponse
            );
            await this.loaderService.hideLoader(784);
            return;
          }
        } else {
          console.log('this.postCodeResponse null: ', this.postCodeResponse);
          await this.loaderService.hideLoader(789);
          return;
        }
      }

      await this.loaderService.hideLoader();

      if (order_type == 'collection') {
        this.deliveryCharge = 0;
        let totalCharge: number =
          cart_total +
          this.deliveryCharge +
          this.serviceCharge +
          this.packagingCharge +
          this.tipsAmount +
          this.surcharge -
          (this.discountAmount + this.cartTotalBuyGetAmount);
        await this.sendOrder(payment_method, postData, totalCharge);
      } else if (order_type == 'delivery') {
        let totalCharge: number =
          cart_total +
          this.deliveryCharge +
          this.serviceCharge +
          this.packagingCharge +
          this.tipsAmount +
          this.surcharge -
          (this.discountAmount + this.cartTotalBuyGetAmount);
        if (this.deliveryCharge > 0) {
          await this.commonService.showToastMessage(
            `Delivery charge extra will be added ${this.productPricePipe.transform(
              this.deliveryCharge.toString()
            )}`
          );
        }
        await this.sendOrder(payment_method, postData, totalCharge);
      }
    }
  }

  private async sendOrder(payment_method, postData, totalCharge) {
    if (payment_method === 'cash') {
      await this.placeOrderToServer(postData);
    } else if (payment_method === 'stripe') {
      postData.surcharge = this.cardFree;
      await this.stripePayment(postData, totalCharge);
    } else if (payment_method === 'sagepay') {
      postData.surcharge = this.cardFree;
      await this.sagepayPayment(postData, totalCharge);
    } else if (payment_method === 'cardstream') {
      postData.surcharge = this.cardFree;
      await this.cardstreamPayment(postData, totalCharge);
    } else if (payment_method === 'paypal') {
      // postData.surcharge = this.cardFree;
      // this.payPalPayment(postData, totalCharge);
    }
  }

  async placeOrderToServer(postData: any) {
    let message = '';
    await this.loaderService.showLoader();
    await this.checkoutService.setOrder(postData).subscribe({
      next: async (result) => {
        this.isOrderSubmitted = true;
        this.submitted = true;
        let isOrderSuccess = false;
        this.submitOrderResponse = result;

        if (this.submitOrderResponse != null) {
          isOrderSuccess = this.submitOrderResponse.is_order_success;
          this.isOrderSuccess = isOrderSuccess;
          message = this.submitOrderResponse.message;
          if (isOrderSuccess) {
            await this.cartService.clearCart();
            this.cartData = await this.cartService.getCart();
            // this.navCtrl.setRoot('MenuPage');
          }
        }
        await this.loaderService.hideLoader();
        await this.gotoOrderSubmitMessagePage(
          this.isOrderSuccess,
          this.order_type,
          this.shopInfo.shop_name,
          message
        );
      },
      error: async (error) => {
        this.isOrderSuccess = false;
        await this.loaderService.hideLoader();
        await this.gotoOrderSubmitMessagePage(
          this.isOrderSuccess,
          this.order_type,
          this.shopInfo.shop_name,
          message
        );
      },
    });
  }

  private async stripePayment(postData: any, totalCharge: number) {
    console.log('Stripe Payment');
    this.loaderService.showLoader();
    let cardHolderName = this.orderForm.get('name').value;
    await this.stripeService
      .createToken(this.card.element, { name: cardHolderName })
      .subscribe((result) => {
        console.log('result: ', result.token);
        if (result.token) {
          let tokenId = result.token.id;
          let cardData = {
            token: tokenId,
            customer_email: this.loginData.email,
            amount: totalCharge,
          };
          this.checkoutService.stripePayment(cardData).subscribe({
            next: (result) => {
              console.log('result: ', result);
              this.cardPaymentResponse = result;
              let isPayed = false;
              if (this.cardPaymentResponse != null) {
                isPayed = this.cardPaymentResponse.is_payed;
                if (isPayed) {
                  this.loaderService.hideLoader();
                  this.placeOrderToServer(postData);
                } else {
                  this.submitted = false;
                  this.commonService.showToastMessage(
                    'Payment not confirm,Please try another.',
                    5000
                  );
                  this.loaderService.hideLoader();
                }
              } else {
                this.loaderService.hideLoader();
              }
            },
            error: (error) => {
              this.isOrderSuccess = false;
              this.submitted = false;
              this.loaderService.hideLoader();
              this.commonService.showToastMessage(
                'Payment not confirm,Please try another.',
                5000
              );
            },
          });
        } else if (result.error) {
          this.submitted = false;
          this.loaderService.hideLoader();
          this.commonService.showToastMessage(
            'Payment not confirm,Please try another.',
            5000
          );
        }
      });
  }

  async sagepayPayment(postData: any, totalCharge: number) {
    console.log('postData: ', postData);
    await this.loaderService.showLoader();
    const customerId = this.userData.id;
    let url = `${environment.webUrl}sagepay_gateway/payment?ci=${customerId}&tc=${totalCharge}&chn=`;
    const browser = await this.inAppBrowser.create(
      url,
      '_blank',
      'location=no'
    );
    await browser.on('loadstop').subscribe(async (event: InAppBrowserEvent) => {
      console.log('event: ', event);
      if (
        event.url ==
        `${environment.webUrl}sagepay_gateway/redirect_to_merchant/${customerId}`
      ) {
        setTimeout(async (time) => {
          await browser.close();
          await this.checkoutService
            .getSagepayTransactionInfo({ customerId })
            .subscribe({
              next: async (result) => {
                console.log('result: ', result);
                if (result) {
                  let transactionInfo = result.transactionInfo;
                  if (transactionInfo) {
                    let transactionId = transactionInfo.transaction_id;
                    if (transactionId) {
                      postData.transactionId = transactionId;
                      await this.placeOrderToServer(postData);
                    }
                  } else {
                    this.router.navigate(['/cart'], { replaceUrl: true });
                  }
                }
              },
              error: (error) => {
                console.log('error: ', error);
              },
            });
        }, 5000);
      } else if (event.url == `${environment.webUrl}sagepay_gateway/close/`) {
        await browser.close();
        this.router.navigate(['/cart'], { replaceUrl: true });
      }
    });
    await this.loaderService.hideLoader();
  }

  async cardstreamPayment(postData: any, totalCharge: number) {
    console.log('postData: ', postData);
    console.log('totalCharge: ', totalCharge);
    const customerId = this.userData.id;
    let url = `${environment.webUrl}cardstream_gateway/payment?ci=${customerId}&tc=${totalCharge}&chn=`;
    const browser = await this.inAppBrowser.create(
      url,
      '_blank',
      'location=no'
    );
    browser.on('loadstop').subscribe(async (event: InAppBrowserEvent) => {
      console.log('event: ', event);
      if (
        event.url ==
        `${environment.webUrl}cardstream_gateway/redirect_to_merchant/${customerId}`
      ) {
        setTimeout(async (time) => {
          await browser.close();
          await this.checkoutService
            .getCardstreamTransactionInfo({ customerId })
            .subscribe({
              next: async (result) => {
                console.log('result: ', result);
                if (result) {
                  let transactionInfo = result.transactionInfo;
                  if (transactionInfo) {
                    let transactionId = transactionInfo.transaction_id;
                    if (transactionId) {
                      postData.transactionId = transactionId;
                      await this.placeOrderToServer(postData);
                    }
                  } else {
                    this.router.navigate(['/cart'], { replaceUrl: true });
                  }
                }
              },
              error: (error) => {
                console.log('error: ', error);
              },
            });
        }, 5000);
      } else if (
        event.url == `${environment.webUrl}cardstream_gateway/close/`
      ) {
        await browser.close();
        this.router.navigate(['/cart'], { replaceUrl: true });
      }
    });
    await this.loaderService.hideLoader();
  }

  async minimumDeliveryOrderAmountAlert(minimumDeliveryOrderAmount) {
    let minimumDeliveryAmountAlert = await this.alertCtrl.create({
      header:
        'Minimum delivery order amount is ' +
        this.productPricePipe.transform(minimumDeliveryOrderAmount.toString()),
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            this.submitted = false;
            return;
          },
        },
        {
          text: 'Back to cart',
          handler: () => {
            this.router.navigate(['/cart'], { replaceUrl: true });
            // this.navCtrl.pop();
          },
        },
      ],
    });
    minimumDeliveryAmountAlert.present();
  }

  // ---paypal----
  // private payPalPayment(postData: any, totalCharge: number) {
  //   if (this.payPalEnvironment == 'sandbox') {
  //     this.payPalEnvironment = 'PayPalEnvironmentSandbox';
  //   } else if (this.payPalEnvironment == 'live') {
  //     this.payPalEnvironment = 'PayPalEnvironmentProduction';
  //   } else {
  //     this.payPalEnvironment = 'PayPalEnvironmentProduction';
  //   }

  //   let env = this;
  //   this.payPal
  //     .init({
  //       PayPalEnvironmentProduction: this.payPalEnvironmentProduction,
  //       PayPalEnvironmentSandbox: this.payPalEnvironmentSandbox,
  //     })
  //     .then(
  //       () => {
  //         // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
  //         this.payPal
  //           .prepareToRender(
  //             this.payPalEnvironment,
  //             new PayPalConfiguration({
  //               // Only needed if you get an "Internal Service Error" after PayPal login!
  //               //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
  //             })
  //           )
  //           .then(
  //             () => {
  //               let payment = new PayPalPayment(
  //                 totalCharge.toString(),
  //                 this.payPalCurrency,
  //                 this.shopInfo.shop_name,
  //                 'sale'
  //               );
  //               env.payPal.renderSinglePaymentUI(payment).then(
  //                 (responseData) => {
  //                   let paymentState = responseData.response.state;
  //                   if (paymentState == 'approved') {
  //                     this.placeOrderToServer(postData);
  //                   } else {
  //                     this.submitted = false;
  //                     this.authServiceProvider.showToastMessage(
  //                       'Payment not confirm,Please try again.',
  //                       10000
  //                     );
  //                   }
  //                   // Successfully paid

  //                   // Example sandbox response
  //                   //
  //                   // {
  //                   //   "client": {
  //                   //     "environment": "sandbox",
  //                   //     "product_name": "PayPal iOS SDK",
  //                   //     "paypal_sdk_version": "2.16.0",
  //                   //     "platform": "iOS"
  //                   //   },
  //                   //   "response_type": "payment",
  //                   //   "response": {
  //                   //     "id": "PAY-1AB23456CD789012EF34GHIJ",
  //                   //     "state": "approved",
  //                   //     "create_time": "2016-10-03T13:33:33Z",
  //                   //     "intent": "sale"
  //                   //   }
  //                   // }
  //                 },
  //                 (rejectCause) => {
  //                   this.submitted = false;
  //                   // Error or render dialog closed without being successful
  //                   this.authServiceProvider.showToastMessage(
  //                     rejectCause,
  //                     10000
  //                   );
  //                 }
  //               );
  //             },
  //             (rejectCause) => {
  //               // Error in configuration
  //               this.authServiceProvider.showToastMessage(rejectCause, 10000);
  //             }
  //           );
  //       },
  //       (rejectCause) => {
  //         this.submitted = false;
  //         // Error in initialization, maybe PayPal isn't supported or something else
  //         this.authServiceProvider.showToastMessage(rejectCause, 10000);
  //       }
  //     );
  // }
  // ------paypal--------

  async gotoOrderSubmitMessagePage(
    isOrderSuccess,
    orderType,
    shopName,
    message
  ) {
    await this.loaderService.showLoader();
    const submitMessageModal = await this.modalController.create({
      component: OrderSubmitMessageComponent,
      backdropDismiss: false,
      cssClass: 'order-submit-msg-modal',
      componentProps: {
        isOrderSuccess: isOrderSuccess,
        orderType: orderType,
        shopName: shopName,
        message: message,
      },
    });
    await submitMessageModal.present();
    await this.loaderService.hideLoader();
  }

  async showDiscountMessage() {
    let orderType = this.orderForm.get('order_type').value;
    let paymentMethod = this.orderForm.get('payment_method').value;
    if (paymentMethod == null) {
      paymentMethod = 'cash';
    }

    if (this.shopInfo) {
      this.shopInfo = await JSON.parse(localStorage.getItem('shopInfo'));
    }
    if (orderType == 'collection') {
      this.showDeliveryDetailsBlock = true;
      this.orderTypeTimeSelectionText = 'Collection Time';
      this.deliveryAndCollectionTimingOptions = this.shopInfo
        ? this.shopInfo.collection_time_options
        : [];
      if (this.deliveryAndCollectionTimingOptions.length == 0) {
        this.orderTypeTimeSelectionText =
          'Collection time is not available at this moment';
      }
    } else if (orderType == 'delivery') {
      this.showDeliveryDetailsBlock = false;
      this.orderTypeTimeSelectionText = 'Delivery Time';
      this.deliveryAndCollectionTimingOptions = this.shopInfo
        ? this.shopInfo.delivery_time_options
        : [];
      if (this.deliveryAndCollectionTimingOptions.length == 0) {
        this.orderTypeTimeSelectionText =
          'Delivery time is not available at this moment';
      }
    }

    // this.discountService.showDiscountToastMessage(orderType);
    this.checkCardValidity(orderType, paymentMethod);
  }

  async showMessageForPaymentMethod() {
    let orderType = this.orderForm.get('order_type').value;
    let paymentMethod = this.orderForm.get('payment_method').value;
    await this.checkCardValidity(orderType, paymentMethod);
  }

  async checkCardValidity(orderType, paymentMethod) {
    let searchOrderType = 'none';
    if (orderType == 'delivery') {
      searchOrderType = 'collection';
    } else if (orderType == 'collection') {
      searchOrderType = 'delivery';
    }

    if (!(await this.cartService.isCartIsValidAsOrderType(orderType))) {
      // console.log('Cart valid false', orderType);
      let cartMessage = await this.cartService.getCartValidationAlertMessage(
        orderType,
        this.shopInfo.customMessages.cartValidity
      );
      await this.cartService.showCartContainOrderTypeItem(
        cartMessage.title,
        cartMessage.message,
        false
      );
      if (orderType == 'delivery') {
        this.order_type = 'collection';
      } else {
        this.order_type = 'delivery';
      }
      this.orderForm.get('order_type').setValue(this.order_type);
    } else {
      // this.discountService.showDiscountToastMessage(orderType);
      await this.discountService.showToastMessageAsOrderType(
        orderType,
        paymentMethod,
        this.packagingChargeInfo
      );
      await this.discountService.setOrderType(orderType);
      this.order_type = orderType;
    }
  }

  getFullName(title, firstName, lastName) {
    let fullName = '';
    if (title != '' && title != null) {
      fullName = title + ' ' + firstName + ' ' + lastName;
    } else {
      fullName = firstName + ' ' + lastName;
    }

    return fullName;
  }
}
