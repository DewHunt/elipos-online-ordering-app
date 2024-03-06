import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from './../../../environments/environment';
import { AuthService } from './../../auth/services/auth.service';
import { HomeService } from './../../home/services/home.service';
import { CommonService } from './../../shared/services/common.service';
import { LoaderService } from './../../shared/services/loader.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart: any = [];
  isDiscountAvailable: boolean = false;
  discountType: string = 'amount';
  discountPercent: number = 0;
  discountAmount: number = 0;
  shopInfo: any;
  serviceChargeInfo: any;
  serviceCharge: number = 0;
  packagingChargeInfo: any;
  packagingCharge: number = 0;
  private _cart: BehaviorSubject<any[]>;

  constructor(
    private authServiceProvider: AuthService,
    private loaderService: LoaderService,
    private homeService: HomeService,
    private commonService: CommonService,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private toast: ToastController,
    private router: Router
  ) {
    this.shopInfo = JSON.parse(localStorage.getItem('shopInfo'));
    this.serviceChargeInfo = this.shopInfo?.service_charge;
    this.packagingChargeInfo = this.shopInfo?.packaging_charge;
    if (localStorage.getItem('cart')) {
      this.cart = JSON.parse(localStorage.getItem('cart'));
    }
    this._cart = <BehaviorSubject<any[]>>new BehaviorSubject(this.cart);
  }

  getDiscountDetails(customerId): Observable<any> {
    const url = `${environment.serviceUrl}set_order/get_discount_details`;
    return this.http.post<any>(url, { customer_id: customerId });
  }

  checkCartValidity(data): Observable<any> {
    const url = `${environment.serviceUrl}set_order/checkCartValidity`;
    return this.http.post<any>(url, data);
  }

  async showSwipeMenuToast(message) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000,
      position: 'top',
      cssClass: 'text-center menu-swipe-message',
    });

    toast.onDidDismiss().then(() => {});
    toast.present();
  }

  getTotalAmount(): number {
    let sum = 0;
    if (!this.cart || !this.cart.length) {
      return sum;
    }
    for (let i = 0; i < this.cart.length; i = i + 1) {
      if (this.cart[i].isDeals) {
        sum = sum + this.cart[i].quantity * this.cart[i].price;
      } else {
        sum = sum + this.cart[i].quantity * this.cart[i].item.price;
      }
    }
    return sum;
  }

  getTotalItem(): number {
    return this.getCart().length;
  }

  getTotalBuyGetAmout(): number {
    let sum = 0;
    if (!this.cart || !this.cart.length) {
      return sum;
    }
    for (let cartItem of this.cart) {
      if (cartItem.hasOwnProperty('buy_get_amount')) {
        sum += cartItem.buy_get_amount;
      }
    }
    return sum;
  }

  getServiceCharge(
    serviceChargeInfo = this.serviceChargeInfo,
    orderType = 'collection',
    paymentMethod = 'cash'
  ) {
    let charge = 0;
    if (this.cart.length > 0 && serviceChargeInfo) {
      if (
        serviceChargeInfo.hasOwnProperty('is_service_charge_applicable') &&
        serviceChargeInfo.is_service_charge_applicable == 1
      ) {
        if (
          orderType == 'collection' &&
          serviceChargeInfo.hasOwnProperty('for_collection') &&
          serviceChargeInfo.for_collection == 1
        ) {
          if (
            paymentMethod == 'cash' &&
            serviceChargeInfo.hasOwnProperty('is_active_collection_cash') &&
            serviceChargeInfo.is_active_collection_cash == 1
          ) {
            if (serviceChargeInfo.hasOwnProperty('collection_cash_charge')) {
              charge = parseInt(serviceChargeInfo.collection_cash_charge);
            }
          }

          if (
            paymentMethod != 'cash' &&
            serviceChargeInfo.hasOwnProperty('is_active_collection_card') &&
            serviceChargeInfo.is_active_collection_card == 1
          ) {
            if (serviceChargeInfo.hasOwnProperty('collection_card_charge')) {
              charge = parseInt(serviceChargeInfo.collection_card_charge);
            }
          }
        }

        if (
          orderType == 'delivery' &&
          serviceChargeInfo.hasOwnProperty('for_delivery') &&
          serviceChargeInfo.for_delivery == 1
        ) {
          if (
            paymentMethod == 'cash' &&
            serviceChargeInfo.hasOwnProperty('is_active_delivery_cash') &&
            serviceChargeInfo.is_active_delivery_cash == 1
          ) {
            if (serviceChargeInfo.hasOwnProperty('delivery_cash_charge')) {
              charge = parseInt(serviceChargeInfo.delivery_cash_charge);
            }
          }

          if (
            paymentMethod != 'cash' &&
            serviceChargeInfo.hasOwnProperty('is_active_delivery_card') &&
            serviceChargeInfo.is_active_delivery_card == 1
          ) {
            if (serviceChargeInfo.hasOwnProperty('delivery_card_charge')) {
              charge = parseInt(serviceChargeInfo.delivery_card_charge);
            }
          }
        }
      }
    }
    return charge;
  }

  getPackagingCharge(
    packagingChargeInfo = this.packagingChargeInfo,
    orderType = 'collection'
  ) {
    let charge = 0;
    if (this.cart && this.cart.length > 0 && packagingChargeInfo) {
      if (
        packagingChargeInfo.hasOwnProperty('is_packaging_charge_applicable') &&
        packagingChargeInfo.is_packaging_charge_applicable == 1
      ) {
        if (
          orderType == 'collection' &&
          packagingChargeInfo.hasOwnProperty('is_for_collection') &&
          packagingChargeInfo.is_for_collection == 1
        ) {
          if (packagingChargeInfo.hasOwnProperty('is_for_collection')) {
            charge = parseFloat(
              packagingChargeInfo.collection_packaging_charge
            );
          }
        }

        if (
          orderType == 'delivery' &&
          packagingChargeInfo.hasOwnProperty('is_for_delivery') &&
          packagingChargeInfo.is_for_delivery == 1
        ) {
          if (packagingChargeInfo.hasOwnProperty('delivery_packaging_charge')) {
            charge = parseFloat(packagingChargeInfo.delivery_packaging_charge);
          }
        }
      }
    }
    return charge;
  }

  removeCartItem(index): void {
    this.cart.splice(index, 1);
    this.setCart(this.cart);
    this.commonService.showToastMessage('Product has been removed.');
  }

  removeFreeCartItem(id) {
    const itemIndex = this.cart.findIndex((item) => {
      return item.id === id;
    });
    if (itemIndex > -1) {
      this.cart.splice(itemIndex, 1);
      this.setCart(this.cart);
    }
  }

  async removeFreeCartItems() {
    await this.cart.forEach((item, index) => {
      if (item.isFree) {
        // remove free item directly from cart
        this.cart.splice(index, 1);
      }
    });
    this.setCart(this.cart);
  }

  setCart(cart): void {
    this._cart.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  updateCartForBuyAndGetAmount(categoryId: any, buyGetId: any) {
    let cartData: any = this.cart;
    if (Object.keys(cartData).length > 0) {
      let buyGetAmount: number = 0;
      let totalQty: number = 0;
      let buyQty: number = 0;
      let getQty: number = 0;
      let buyGetCurrentContents: any = {};
      let multiplier: number = 0;
      let offerQty: number = 0;
      let itemQty: number = 0;
      let itemRegularPrice: number = 0;

      for (let index in cartData) {
        if (
          this.cart[index].is_buy_get_discount === true &&
          this.cart[index].item.category_id == categoryId &&
          this.cart[index].buy_get_id == buyGetId
        ) {
          totalQty += parseInt(this.cart[index].quantity);
          buyQty = parseInt(this.cart[index].buy_qty);
          getQty = parseInt(this.cart[index].get_qty);
          if (this.cart[index].buy_get_amount > 0) {
            this.cart[index].free_item_qty = 0;
            this.cart[index].buy_get_amount = 0;
            this.setCart(this.cart);
          }
          buyGetCurrentContents[index] = cartData[index];
        }
        // i++;
      }
      multiplier = buyQty + 1;
      // offerQty = parseInt(totalQty / multiplier);
      offerQty = Math.floor(totalQty / multiplier);

      for (let buyGetIndex in buyGetCurrentContents) {
        itemQty = parseInt(this.cart[buyGetIndex].quantity);
        itemRegularPrice = this.cart[buyGetIndex].item.regular_price;
        if (itemQty != 0 && offerQty > itemQty) {
          offerQty -= itemQty;
          buyGetAmount = itemQty * getQty * itemRegularPrice;
          this.cart[buyGetIndex].free_item_qty = itemQty;
          this.cart[buyGetIndex].buy_get_amount = buyGetAmount;
        } else {
          buyGetAmount = offerQty * getQty * itemRegularPrice;
          this.cart[buyGetIndex].free_item_qty = offerQty;
          this.cart[buyGetIndex].buy_get_amount = buyGetAmount;
          break;
        }
      }
      this.setCart(this.cart);
    }
  }

  clearCart(): void {
    this.cart = [];
    this._cart.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  getCart() {
    return this.cart;
  }

  insert(data, message = 'Product is added to you cart.'): void {
    if (localStorage.getItem('cart')) {
      this.cart = JSON.parse(localStorage.getItem('cart'));
    }

    data.isAvailable = true;
    if (!data.hasOwnProperty('isFree')) {
      data.isFree = false;
    }
    if (this.cart.length) {
      let itemIndex = -1;
      itemIndex = this.cart.findIndex((element) => element.id === data.id);
      if (itemIndex >= 0) {
        this.cart[itemIndex].quantity = this.cart[itemIndex].quantity + 1;
      } else {
        this.cart.push(data);
      }
    } else {
      this.cart.push(data);
    }
    this._cart.next(this.cart);
    console.log('this.cart: ', this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));

    if (localStorage.getItem('cart')) {
      this.cart = JSON.parse(localStorage.getItem('cart'));
    }

    this.commonService.showToastMessage(message);
  }

  insertForReOrder(data): void {
    if (localStorage.getItem('cart')) {
      this.cart = JSON.parse(localStorage.getItem('cart'));
    }
    data.isAvailable = true;
    if (this.cart.length) {
      let itemIndex = -1;
      itemIndex = this.cart.findIndex((element) => element.id == data.id);
      if (itemIndex >= 0) {
        this.cart[itemIndex].quantity = this.cart[itemIndex].quantity + 1;
      } else {
        this.cart.push(data);
      }
    } else {
      this.cart.push(data);
    }
    this._cart.next(this.cart);
    localStorage.setItem('cart', JSON.stringify(this.cart));

    if (localStorage.getItem('cart')) {
      this.cart = JSON.parse(localStorage.getItem('cart'));
    }
  }

  async getCartFreeItemAsItemOfferId(id = 0) {
    return await this.cart.find((item) => {
      return item.isFree && item.freeDetails.id == id;
    });
  }

  async getCartFreeItems() {
    return await this.cart.filter((item) => {
      return item.isFree;
    });
  }

  async getTotalFreeItemIsAdded() {
    const items = await this.getCartFreeItems();
    return items.length;
  }

  // get_discount_details() {
  //   if (this.authServiceProvider.isLogged()) {
  //     let customerInfo = JSON.parse(localStorage.getItem('userData'));
  //     this.authServiceProvider
  //       .postData(
  //         { customer_id: customerInfo.id },
  //         'set_order/get_discount_details'
  //       )
  //       .then((result) => {
  //         this.isDiscountAvailable = result['is_discount_available'];
  //         if (this.isDiscountAvailable) {
  //           let discountDetails = result['discount_details'];
  //           this.discountType = discountDetails.discount_type;
  //           this.discountPercent = discountDetails.percent;
  //           if (this.discountType == 'amount') {
  //             this.discountAmount = discountDetails.amount;
  //           }
  //         } else {
  //           this.discountAmount = 0;
  //           this.discountType = 'amount';
  //           this.discountPercent = 0;
  //         }
  //       })
  //       .catch((err) => {
  //         this.discountAmount = 0;
  //         this.discountType = 'amount';
  //         this.discountPercent = 0;
  //       });
  //   } else {
  //     this.discountAmount = 0;
  //     this.discountType = 'amount';
  //     this.discountPercent = 0;
  //   }
  // }

  getDiscount() {
    if (this.discountType == 'percent') {
      this.discountAmount =
        (this.getTotalAmount() * this.discountPercent) / 100;
      return this.discountAmount;
    } else {
      return this.discountAmount;
    }
  }

  isCartIsValidAsOrderType(orderType) {
    if (!this.cart || !this.cart.length) {
      return true;
    }
    let storageOrderType = localStorage.getItem('orderType');
    let searchOrderType = '';
    if (orderType == 'delivery') {
      searchOrderType = 'collection';
    } else if (orderType == 'collection') {
      searchOrderType = 'delivery';
    }

    let cartItemReturn = this.cart.find(
      (cartItem) => cartItem.orderType === searchOrderType
    );
    if (cartItemReturn) {
      return false;
    } else {
      return true;
    }
  }

  async showCartContainOrderTypeItem(
    $title,
    $message,
    isPush: boolean = false
  ) {
    let alert = await this.alertCtrl.create({
      header: $title,
      message: $message,
      mode: 'ios',
      cssClass: 'cart-validation-alert',
      buttons: [
        {
          text: 'Go to cart',
          handler: () => {
            this.loaderService.showLoader();
            if (isPush) {
              this.router.navigate(['/cart'], { replaceUrl: true });
            } else {
              // this.app.getActiveNav().pop();
            }
          },
        },
        {
          text: 'Ok',
          handler: (data) => {
            this.loaderService.hideLoader();
          },
        },
      ],
    });
    alert.present();
  }

  getCartValidationAlertMessage(orderType, customMessages) {
    if (orderType == 'collection') {
      return {
        title: customMessages.titleDelivery,
        message: customMessages.messageDelivery,
      };
    } else if (orderType == 'delivery') {
      return {
        title: customMessages.titleCollection,
        message: customMessages.messageCollection,
      };
    } else if (orderType == 'none') {
      return { title: '', message: '' };
    } else {
      return { title: '', message: '' };
    }
  }

  async showCartProductIsUpdated(message) {
    const cartUpdatedMessage = await this.toast.create({
      message: message,
      position: 'middle',
      cssClass: 'text-center custom-position',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    cartUpdatedMessage.onDidDismiss().then(() => {});
    cartUpdatedMessage.present();
  }

  precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  get getCartItems() {
    return this._cart.asObservable();
  }
}
