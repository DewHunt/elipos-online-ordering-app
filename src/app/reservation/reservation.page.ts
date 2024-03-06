import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  InAppBrowser,
  InAppBrowserEvent,
} from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ModalController } from '@ionic/angular';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { CheckoutService } from '../checkout/services/checkout.service';
import { CommonService } from '../shared/services/common.service';
import { AuthService } from './../auth/services/auth.service';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';
import { ReservationSubmitMessageComponent } from './components/reservation-submit-message/reservation-submit-message.component';
import { ReservationService } from './services/reservation.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
})
export class ReservationPage implements OnInit {
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
  pageInfo: any;
  pageTitle = 'Reservations';
  reservationForm: FormGroup;
  minReservationDate: string;
  maxReservationDate: string;
  reservationDate: string;
  maxTime: string = '18:00';
  minTime: string = '23:45';
  shopInfo: any;
  shopName: string;
  currentDate: any;
  currentTime: any;
  isTimeInvalid: boolean;
  timeInvalidMessage: string = '';
  isDateInvalid: boolean;
  dateInvalidMessage: string = '';
  userInfo: any;
  userName: any;
  settingsPaymentMethod: string;
  paymentSystemLabel: any;
  settingsPaymentGateway: any;
  cardFee: any = 0;
  selectedPaymentGateway: string;
  isReservationPaymentAvailable: boolean = false;
  reservationAmount: any = 0;
  randomString = '';
  isCaptchaMatched = false;

  constructor(
    private homeService: HomeService,
    private checkoutService: CheckoutService,
    private loaderService: LoaderService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router,
    private inAppBrowser: InAppBrowser,
    private modalController: ModalController,
    private stripeService: StripeService,
    private commonService: CommonService
  ) {}

  async ngOnInit() {
    // this.randomString = this.commonService.generateRandomString();
    // await this.reservationFormInit();
    // await this.getDataForForm();
    // await this.getShopTimingInfo();
    // await this.getPaymentSettings();
    // this.shopInfo = await JSON.parse(localStorage.getItem('shopInfo'));
    // this.paymentSystemLabel = this.shopInfo.paymentSystemLabel;
    // console.log('this.randomString: ', this.randomString);
  }

  async ionViewDidEnter() {
    this.randomString = this.commonService.generateRandomString();
    await this.getDataForForm();
    await this.getShopTimingInfo();
    await this.getPaymentSettings();
    await this.reservationFormInit();
    this.shopInfo = await JSON.parse(localStorage.getItem('shopInfo'));
    this.paymentSystemLabel = this.shopInfo.paymentSystemLabel;
    // console.log('this.randomString: ', this.randomString);
  }

  async doRefresh(event) {
    await this.getDataForForm();
    await this.getShopTimingInfo();
    await this.getShopInfo();
    await this.getPaymentSettings();
    // this.refreshCaptcha();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  refreshCaptcha() {
    this.randomString = this.commonService.generateRandomString();
    this.reservationForm.get('captchaText').setValue('');
    this.reservationForm.get('captchaText').updateValueAndValidity();
  }

  async getDataForForm() {
    this.pageInfo = await this.homeService.getPageByComponentName(
      'ReservationPage'
    );
    this.pageTitle = this.pageInfo
      ? this.pageInfo.title.toUpperCase()
      : this.pageTitle;
    this.userInfo = await this.authService.getUserData();
    // console.log('this.userInfo: ', this.userInfo);
    if (this.userInfo) {
      if (this.userInfo.first_name) {
        this.userName = this.userInfo.first_name;
        if (this.userInfo.last_name) {
          this.userName = ' ' + this.userInfo.last_name;
        }
      }
    }
    this.shopInfo = await this.homeService.getShopSettingsInfoFromLocal();
    this.shopName = this.shopInfo.shop_name;
  }

  async getPaymentSettings() {
    await this.checkoutService.getPaymentSettings().subscribe({
      next: (result) => {
        if (result['data']) {
          let data = result['data'];
          this.settingsPaymentMethod = data.payment_method;
          this.settingsPaymentGateway = data.payment_gateway;
          this.isReservationPaymentAvailable = false;
          this.isCaptchaMatched = false;
          if (data.reservation === 'yes') {
            this.isReservationPaymentAvailable = true;
            this.isCaptchaMatched = true;
          }
          this.reservationAmount = data.reservation_amount;
          this.cardFee = data.surcharge;

          if (
            this.settingsPaymentGateway &&
            (this.settingsPaymentMethod == 'online' ||
              this.settingsPaymentMethod == 'both') &&
            this.isReservationPaymentAvailable
          ) {
            this.reservationForm
              .get('payment_method')
              .setValidators([Validators.required]);
            this.reservationForm.get('captchaText').setValidators([]);
            if (this.settingsPaymentGateway.indexOf('paypal') >= 0) {
              this.reservationForm.get('payment_method').setValue('sagepay');
              this.selectedPaymentGateway = 'sagepay';
            } else if (this.settingsPaymentGateway.indexOf('stripe') >= 0) {
              this.reservationForm.get('payment_method').setValue('stripe');
              this.selectedPaymentGateway = 'stripe';
            } else if (this.settingsPaymentGateway.indexOf('nochex') >= 0) {
              this.reservationForm.get('payment_method').setValue('sagepay');
              this.selectedPaymentGateway = 'sagepay';
            } else if (this.settingsPaymentGateway.indexOf('sagepay') >= 0) {
              this.reservationForm.get('payment_method').setValue('sagepay');
              this.selectedPaymentGateway = 'sagepay';
            } else if (this.settingsPaymentGateway.indexOf('cardstream') >= 0) {
              this.reservationForm.get('payment_method').setValue('cardstream');
              this.selectedPaymentGateway = 'cardstream';
            }
          } else {
            this.reservationForm
              .get('captchaText')
              .setValidators([Validators.required]);
            this.reservationForm.get('payment_method').setValidators([]);
            this.reservationForm.get('payment_method').setValue('');
          }
          this.reservationForm.get('payment_method').updateValueAndValidity();
          this.reservationForm.get('captchaText').updateValueAndValidity();
        }
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
  }

  async getShopInfo() {
    await this.homeService.getShopSettingsInfo().subscribe({
      next: (result) => {
        localStorage.setItem('shopInfo', JSON.stringify(result['data']));
        this.shopInfo = result['data'];
        let payment = this.shopInfo.payment_gateway;
        this.paymentSystemLabel = this.shopInfo.paymentSystemLabel;
      },
      error: (error) => {
        console.log('error: ', error);
      },
    });
  }

  async getShopTimingInfo() {
    await this.loaderService.showLoader();
    await this.reservationService.getShopTimingInfo().subscribe({
      next: async (result) => {
        await localStorage.setItem(
          'shopOpeningClosingDetails',
          JSON.stringify(result['data'].shop_timing_details)
        );
        await localStorage.setItem(
          'weekendOffDetails',
          JSON.stringify(result['data'].weekend_off_details)
        );
        await localStorage.setItem(
          'bookingSettingsDetails',
          JSON.stringify(result['data'].booking_settings_details)
        );
        await this.reservationDateInit();
        await this.loaderService.hideLoader();
      },
      error: async (error) => {
        console.log('error: ', error);
        await this.loaderService.hideLoader();
      },
    });
  }

  async reservationFormInit() {
    this.reservationForm = await this.formBuilder.group({
      email: [this.userInfo.email, [Validators.required, Validators.email]],
      name: [this.userName, [Validators.required]],
      mobile: [this.userInfo.mobile, [Validators.required]],
      number_of_guest: [, [Validators.required]],
      reservation_date: [this.currentDate, [Validators.required]],
      start_time: [this.currentTime, [Validators.required]],
      booking_purpose: [],
      payment_method: [],
      captchaText: [, [Validators.required]],
    });
  }

  resetReservationForm() {
    this.reservationForm.get('number_of_guest').setValue('');
    this.reservationForm.get('number_of_guest').updateValueAndValidity();
    this.reservationForm.get('booking_purpose').setValue('');
    this.reservationForm.get('booking_purpose').updateValueAndValidity();
    this.isCaptchaMatched = false;
    this.refreshCaptcha();
  }

  checkCaptcha(captchaText) {
    this.isCaptchaMatched = false;
    if (this.isReservationPaymentAvailable) {
      this.isCaptchaMatched = true;
    } else {
      if (captchaText !== '') {
        if (this.randomString === captchaText.detail.value) {
          this.isCaptchaMatched = true;
        }
      }
    }
  }

  async reservationDateInit() {
    let d = new Date();
    let year = d.getFullYear();
    let month = `0${d.getMonth() + 1}`.slice(-2);
    let day = `0${d.getDate()}`.slice(-2);
    let hour = `0${d.getHours()}`.slice(-2);
    let minute = `0${d.getMinutes()}`.slice(-2);

    let minDate = `${year}-${month}-${day}`;
    this.currentDate = `${year}-${month}-${day}`;
    this.currentTime = `${hour}:${minute}`;
    await this.checkValidDate();

    this.minReservationDate = d.toISOString().split('T')[0];

    this.reservationDate = minDate;
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

  setMaxAndMinTime() {
    let today = new Date();
    let dayNumber = today.getDay();
    let todayShopTime: any = this.reservationService.getShopTimingAsDayNumber(
      dayNumber,
      'collection'
    );
    if (todayShopTime) {
      if (todayShopTime.hasOwnProperty('open_time')) {
        this.minTime = todayShopTime.open_time.slice(0, 5);
      }

      if (todayShopTime.hasOwnProperty('close_time')) {
        this.maxTime = todayShopTime.close_time.slice(0, 5);
      }
    }

    if (this.minTime < this.currentTime) {
      this.minTime = this.currentTime;
    }
    // console.log('this.minTime:', this.minTime);
    // console.log('this.maxTime:', this.maxTime);
  }

  async checkValidDate() {
    console.log('this.currentDate: ', this.currentDate);
    let initDate = new Date(this.currentDate);
    let dayNumber = initDate.getDay();
    let isShopClosed = this.reservationService.isShopClosedAsWeekend(dayNumber);
    let bookingClosedInfo = this.reservationService.isBookingClosed(
      this.currentDate
    );
    // console.log('isBookingClosed: ', bookingClosedInfo);
    this.isDateInvalid = false;
    if (isShopClosed || bookingClosedInfo.isClosed) {
      this.isDateInvalid = true;
    }

    if (this.isDateInvalid) {
      this.dateInvalidMessage =
        'We are sincerely sorry! because our activities will be closed on ' +
        this.currentDate;
      if (bookingClosedInfo.message) {
        this.dateInvalidMessage = bookingClosedInfo.message;
      }
    }
    await this.checkValidTime();
  }

  checkValidTime() {
    console.log('this.currentTime: ', this.currentTime);
    let timeValidInfo = this.reservationService.isShopClosedAsTime(
      this.currentTime,
      this.currentDate,
      'collection'
    );
    this.isTimeInvalid = timeValidInfo.isClosed;
    if (this.isTimeInvalid) {
      this.timeInvalidMessage =
        'We are sincerely sorry! because at ' +
        this.currentTime +
        ' our activities will be closed. Please select another time';
      if (timeValidInfo.message) {
        this.timeInvalidMessage = timeValidInfo.message;
      }
    }
  }

  async submit() {
    let formData = this.reservationForm.value;
    formData.amount =
      parseFloat(this.reservationAmount) + parseFloat(this.cardFee);
    if (formData.payment_method === 'stripe') {
      this.stripePayment(formData);
    } else if (formData.payment_method === 'sagepay') {
      this.sagepayPayment(formData);
    } else if (formData.payment_method === 'cardstream') {
      this.cardstreamPayment(formData);
    } else {
      formData.amount = 0;
      this.setReservation(formData);
    }
  }

  async stripePayment(formData) {
    this.loaderService.showLoader();
    let cardHolderName = this.reservationForm.get('name').value;
    await this.stripeService
      .createToken(this.card.element, { name: cardHolderName })
      .subscribe((result) => {
        if (result.token) {
          let tokenId = result.token.id;
          let cardData = {
            token: tokenId,
            customer_email: this.reservationForm.get('email').value,
            amount: formData.amount,
          };
          this.checkoutService.stripePayment(cardData).subscribe({
            next: async (result) => {
              let cardPaymentResponse = result;
              let isPayed = false;
              if (cardPaymentResponse != null) {
                isPayed = cardPaymentResponse.is_payed;
                if (isPayed) {
                  this.loaderService.hideLoader();
                  await this.setReservation(formData);
                } else {
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
              this.loaderService.hideLoader();
              this.commonService.showToastMessage(
                'Payment not confirm,Please try another.',
                5000
              );
            },
          });
        } else if (result.error) {
          this.loaderService.hideLoader();
          this.commonService.showToastMessage(
            'Payment not confirm,Please try another.',
            5000
          );
        }
      });
  }

  async sagepayPayment(formData: any) {
    const customerId = Math.floor(Math.random() * 100000);
    let reservationCustomerId =
      localStorage.getItem('reservationCustomerId') || '';
    if (reservationCustomerId === '') {
      reservationCustomerId = customerId.toString();
      localStorage.setItem('reservationCustomerId', reservationCustomerId);
    }
    let url = `${environment.webUrl}sagepay_gateway/payment?ci=${reservationCustomerId}&tc=${formData.amount}&chn=${formData.name}`;
    const browser = await this.inAppBrowser.create(
      url,
      '_blank',
      'location=no'
    );
    await browser.on('loadstop').subscribe(async (event: InAppBrowserEvent) => {
      let currentUrl = `${environment.webUrl}sagepay_gateway/redirect_to_merchant/${reservationCustomerId}`;
      console.log('event: ', event);
      if (event.url == currentUrl) {
        setTimeout(async (time) => {
          await browser.close();
          await this.checkoutService
            .getSagepayTransactionInfo({
              customerId: parseInt(reservationCustomerId),
            })
            .subscribe({
              next: async (result) => {
                localStorage.setItem('reservationCustomerId', '');
                if (result) {
                  let transactionInfo = result.transactionInfo;
                  if (transactionInfo) {
                    let transactionId = transactionInfo.transaction_id;
                    if (transactionId) {
                      formData.transactionId = transactionId;
                      await this.setReservation(formData);
                    }
                  } else {
                    await this.resetReservationForm();
                    this.router.navigate(['/reservation'], {
                      replaceUrl: true,
                    });
                  }
                }
              },
              error: async (error) => {
                console.log('error: ', error);
              },
            });
        }, 5000);
      } else if (event.url == `${environment.webUrl}sagepay_gateway/close/`) {
        await browser.close();
        await this.resetReservationForm();
        this.router.navigate(['/reservation'], { replaceUrl: true });
      }
    });
    await this.loaderService.hideLoader();
  }

  async cardstreamPayment(formData: any) {
    const customerId = Math.floor(Math.random() * 100000);
    let reservationCustomerId =
      localStorage.getItem('reservationCustomerId') || '';
    if (reservationCustomerId === '') {
      reservationCustomerId = customerId.toString();
      localStorage.setItem('reservationCustomerId', reservationCustomerId);
    }
    let url = `${environment.webUrl}cardstream_gateway/payment?ci=${reservationCustomerId}&tc=${formData.amount}&chn=${formData.name}`;
    const browser = await this.inAppBrowser.create(
      url,
      '_blank',
      'location=no'
    );
    browser.on('loadstop').subscribe(async (event: InAppBrowserEvent) => {
      let currentUrl = `${environment.webUrl}cardstream_gateway/redirect_to_merchant/${reservationCustomerId}`;
      console.log('event: ', event);
      if (event.url == currentUrl) {
        setTimeout(async (time) => {
          await browser.close();
          await this.checkoutService
            .getCardstreamTransactionInfo({
              customerId: parseInt(reservationCustomerId),
            })
            .subscribe({
              next: async (result) => {
                localStorage.setItem('reservationCustomerId', '');
                if (result) {
                  let transactionInfo = result.transactionInfo;
                  if (transactionInfo) {
                    let transactionId = transactionInfo.transaction_id;
                    if (transactionId) {
                      formData.transactionId = transactionId;
                      await this.setReservation(formData);
                    }
                  } else {
                    this.router.navigate(['/reservation'], {
                      replaceUrl: true,
                    });
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
        await this.resetReservationForm();
        this.router.navigate(['/reservation'], { replaceUrl: true });
      }
    });
    await this.loaderService.hideLoader();
  }

  async setReservation(formData) {
    await this.loaderService.showLoader();
    await this.reservationService
      .setReservation(formData)
      .subscribe(async (result) => {
        const isReservationSuccess = result['is_reservation_success'];
        if (isReservationSuccess) {
          await this.resetReservationForm();
          await this.loaderService.hideLoader();
          await this.gotoSubmitMessagePage();
        } else {
          await this.commonService.showToastMessage(result['message'], 5000);
        }
        await this.loaderService.hideLoader();
      });
  }

  async gotoSubmitMessagePage() {
    await this.loaderService.showLoader();
    const submitMessageModal = await this.modalController.create({
      component: ReservationSubmitMessageComponent,
      backdropDismiss: false,
      cssClass: 'order-submit-msg-modal',
      componentProps: {
        pageTitle: this.pageTitle,
        shopName: this.shopName,
      },
    });
    submitMessageModal.onDidDismiss().then((dismissData) => {
      window.location.href = '/reservation';
    });
    await submitMessageModal.present();
    await this.loaderService.hideLoader();
  }
}
