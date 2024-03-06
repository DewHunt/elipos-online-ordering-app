import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { environment } from './../../../environments/environment';
import { AuthService } from './../../auth/services/auth.service';
import { CartService } from './../../cart/services/cart.service';
import { ProductPricePipe } from './../../shared/pipes/product-price.pipe';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private name: string;
  private amount: number;
  isDiscountAvailable: boolean = false;
  discountType: string = 'collection';
  discountPercent: number = 0;
  discountAmount: number = 0;
  discountDetails: any;
  loyaltyProgramDetails: any;
  discountToast: any;

  constructor(
    private cart: CartService,
    private authServiceProvider: AuthService,
    private http: HttpClient,
    private productPrice: ProductPricePipe,
    private toast: ToastController
  ) {}

  async getDiscountDataFromWeb() {
    // console.log(
    //   'this.authServiceProvider.isLogged(): ',
    //   this.authServiceProvider.isLogged()
    // );
    let customerInfo = await JSON.parse(
      localStorage.getItem('userData') || '{}'
    );
    let customer_id = 0;
    if (await this.authServiceProvider.isLogged()) {
      if (customerInfo) {
        customer_id = customerInfo.id;
      }
    }
    const url = `${environment.serviceUrl}set_order/get_discount_details`;
    await this.http.post<any>(url, { customer_id }).subscribe({
      next: async (result) => {
        this.discountDetails = result['discount_details'];
        this.loyaltyProgramDetails = result['loyalty_program_details'];
        await localStorage.setItem(
          'discountDetails',
          JSON.stringify(this.discountDetails)
        );
        await localStorage.setItem(
          'loyaltyProgramDetails',
          JSON.stringify(this.loyaltyProgramDetails)
        );
      },
      error: (error) => {
        console.log('error: ', error);
        this.discountAmount = 0;
        this.discountType = 'amount';
        this.discountPercent = 0;
      },
    });
  }

  async getDiscountDetails() {
    let localDiscountDetails = await localStorage.getItem('discountDetails');
    if (localDiscountDetails) {
      this.discountDetails = await JSON.parse(localDiscountDetails);
      return this.discountDetails;
    } else {
      return '';
    }
  }

  async getDiscountableAmount() {
    let discountAmount = 0;
    let cartItemPrice = 0;
    let cartData = await this.cart.cart;
    if (!cartData && !cartData.length) {
      return discountAmount;
    }
    for (let cartItem of cartData) {
      if (
        cartItem.is_category_discount === '0' &&
        cartItem.is_item_discount === '0' &&
        cartItem.is_deals_discount === 0
      ) {
        if (cartItem.item !== undefined && cartItem.item !== null) {
          cartItemPrice = parseFloat(cartItem.item.price);
        } else {
          cartItemPrice = parseFloat(cartItem.price);
        }
        discountAmount +=
          cartItemPrice * parseInt(cartItem.quantity) -
          parseFloat(cartItem.buy_get_amount);
      }
    }
    return discountAmount;
  }

  async getDiscount(orderType) {
    let firstOrderDiscount = await this.getDiscountOnFirstOrder();
    let orderTypeDiscount = await this.getDiscountOnOrderType(orderType);
    let loyaltyProgramDiscount = await this.getLoyaltyProgramDiscount(
      orderType
    );
    let totalDiscountAmount = await this.getTotalDiscountAmount(
      firstOrderDiscount,
      orderTypeDiscount,
      loyaltyProgramDiscount
    );

    // console.log('totalAmount', totalAmount);
    // console.log('firstOrderDiscount', firstOrderDiscount);
    // console.log('orderTypeDiscount', orderTypeDiscount);
    // console.log('loyaltyProgramDiscount', loyaltyProgramDiscount);
    // console.log('totalDiscountAmount', totalDiscountAmount);
    // console.log('-----------------------------------------');

    return totalDiscountAmount;
  }

  async getTotalDiscountAmount(
    firstOrderDiscount,
    orderTypeDiscount,
    loyaltyProgramDiscount
  ) {
    let discountDetails = await this.getDiscountDetails();
    let loyaltyProgramDetails = await this.getLoyaltyProgramDetails();
    let discountableAmount = await this.getDiscountableAmount();
    let discountAmount = 0;
    let dailyDiscountAvailability = 0;
    let firstOrderAvailability = 0;
    let loyaltyProgramAvailability = 0;
    let discountText =
      'Congratulations! You have got totalDiscount discounts from totalAmount';

    if (discountDetails.discount_message) {
      discountText = discountDetails.discount_message;
    }

    if (loyaltyProgramDetails.discount_message) {
      discountText = loyaltyProgramDetails.discount_message;
    }

    if (discountDetails[8]?.dailyDiscountAvailability) {
      dailyDiscountAvailability = discountDetails[8].dailyDiscountAvailability;
    }

    if (discountDetails[8]?.firstOrderAvailability) {
      firstOrderAvailability = discountDetails[8].firstOrderAvailability;
    }

    if (loyaltyProgramDetails[0]?.loyaltyProgramAvailability) {
      loyaltyProgramAvailability =
        loyaltyProgramDetails[0].loyaltyProgramAvailability;
    }

    discountAmount = orderTypeDiscount;
    let isMax = 1;

    if (firstOrderDiscount > discountAmount) {
      discountAmount = firstOrderDiscount;
      isMax = 2;
    } else if (loyaltyProgramDiscount > discountAmount) {
      discountAmount = loyaltyProgramDiscount;
      isMax = 3;
    }

    if (dailyDiscountAvailability == 1 && isMax != 1) {
      discountAmount += orderTypeDiscount;
    }

    if (firstOrderAvailability == 1 && isMax != 2) {
      discountAmount += firstOrderDiscount;
    }

    if (loyaltyProgramAvailability == 1 && isMax != 3) {
      discountAmount += loyaltyProgramDiscount;
    }
    this.discountAmount = discountAmount;

    if (discountText) {
      discountText = discountText.replace(
        'totalDiscount',
        this.productPrice.transform(this.discountAmount.toString())
      );
      discountText = discountText.replace(
        'totalAmount',
        this.productPrice.transform(discountableAmount.toString())
      );
    }
    return { amount: this.discountAmount, message: discountText };
  }

  async getDiscountOnOrderType(orderType) {
    let discountDetails = await this.getDiscountDetails();
    if (discountDetails[8]?.dailyDiscountAvailability === '1') {
      let today = new Date();
      let dayNumber = today.getDay();
      if (discountDetails[dayNumber]) {
        let totalAmount = await this.getDiscountableAmount();
        let minOrder = 0;
        let maxDiscountAmount = 0;
        let discountPercent = 0;
        let orderTypeText = '';
        let discountText = '';
        let discountAmount: number = 0;

        if (discountDetails[dayNumber].discount_message_format) {
          discountText = discountDetails[dayNumber].discount_message_format;
        }

        if (discountDetails[dayNumber].minimum_order_amount) {
          minOrder = discountDetails[dayNumber].minimum_order_amount;
        }

        if (discountDetails[dayNumber].maximum_order_amount) {
          maxDiscountAmount = discountDetails[dayNumber].maximum_order_amount;
        }

        if (orderType == 'delivery') {
          orderTypeText = 'Delivery';
          discountPercent =
            discountDetails[dayNumber].delivery_discount_percent;
        } else if (orderType == 'collection') {
          orderTypeText = 'Collection';
          discountPercent =
            discountDetails[dayNumber].collection_discount_percent;
        }

        if (minOrder >= 0 && minOrder <= totalAmount) {
          discountAmount = (totalAmount * discountPercent) / 100;
          if (maxDiscountAmount > 0 && maxDiscountAmount < discountAmount) {
            discountAmount = maxDiscountAmount;
          }
          return discountAmount;
        }
        return 0;
      }
      return 0;
    }
    return 0;
  }

  async getLoyaltyProgramDiscount(orderType) {
    let loyaltyProgramDetails: any = await this.getLoyaltyProgramDetails();
    let totalAmount = await this.getDiscountableAmount();
    let amountOfDiscount = 0;
    let customerTotalOrder = 0;
    let numberOfOrder = 0;
    let minOrderAmount = 0;
    let discountAmount = 0;
    let maxDiscountAmount = 0;
    let offerType = '';

    if (loyaltyProgramDetails) {
      if (loyaltyProgramDetails.customer_total_order) {
        customerTotalOrder = parseInt(
          loyaltyProgramDetails.customer_total_order
        );
      }
      for (let index in loyaltyProgramDetails) {
        if (loyaltyProgramDetails[index].number_Of_order) {
          numberOfOrder = parseInt(
            loyaltyProgramDetails[index].number_Of_order
          );
        }

        if (loyaltyProgramDetails[index].minimum_order_amount) {
          minOrderAmount = parseFloat(
            loyaltyProgramDetails[index].minimum_order_amount
          );
        }

        if (
          minOrderAmount > 0 &&
          totalAmount >= minOrderAmount &&
          customerTotalOrder == numberOfOrder
        ) {
          if (loyaltyProgramDetails[index].discount_amount) {
            discountAmount = parseFloat(
              loyaltyProgramDetails[index].discount_amount
            );
          }
          if (loyaltyProgramDetails[index].maximum_discount_amount) {
            maxDiscountAmount = parseFloat(
              loyaltyProgramDetails[index].maximum_discount_amount
            );
          }
          if (loyaltyProgramDetails[index].offer_type) {
            offerType = loyaltyProgramDetails[index].offer_type;
          }

          if (offerType == 'fixed') {
            amountOfDiscount = discountAmount;
          } else if (offerType == 'percentage') {
            amountOfDiscount = (totalAmount * discountAmount) / 100;
          } else if (offerType == 'others') {
            return 0;
          }

          if (amountOfDiscount > maxDiscountAmount) {
            return maxDiscountAmount;
          } else {
            return amountOfDiscount;
          }
        }
      }
      return 0;
    } else {
      return amountOfDiscount;
    }
  }

  async getDiscountOnFirstOrder() {
    let discountDetails = await this.getDiscountDetails();

    if (discountDetails) {
      if (discountDetails[8].firstOrderAvailability === '1') {
        if (discountDetails.is_customer_first_order) {
          let totalAmount = await this.getDiscountableAmount();
          let minOrder = 0;
          let discountPercent = 0;
          let discountText = '';
          let discountAmount = 0;

          if (discountDetails[7].discount_message_format) {
            discountText = discountDetails[7].discount_message_format;
          }

          if (discountDetails[7].first_order_discount_minimum_order_amount) {
            minOrder =
              discountDetails[7].first_order_discount_minimum_order_amount;
          }

          if (discountDetails[7].first_order_discount_percent) {
            discountPercent = discountDetails[7].first_order_discount_percent;
          }

          if (minOrder >= 0 && minOrder <= totalAmount) {
            discountAmount = (totalAmount * discountPercent) / 100;
            return discountAmount;
          }
          return 0;
        }
        return 0;
      }
      return 0;
    }
    return 0;
  }

  async getLoyaltyProgramDetails() {
    let loyaltyProgramDetails = await localStorage.getItem(
      'loyaltyProgramDetails'
    );
    if (loyaltyProgramDetails) {
      this.loyaltyProgramDetails = await JSON.parse(loyaltyProgramDetails);
      return this.loyaltyProgramDetails;
    } else {
      return '';
    }
  }

  async showDiscountToastMessage(orderType) {
    let discountInfo = await this.getDiscount(orderType);
    let discountAmount = discountInfo.amount;

    if (discountAmount > 0) {
      if (this.discountToast) {
        this.discountToast.dismiss();
        this.discountToast = null;
      }
      let message = discountInfo.message;
      await this.showToastMessage(message);
    }
  }

  async showToastMessageAsOrderType(
    orderType,
    paymentMethod,
    packagingChargeInfo
  ) {
    let message = '';
    let discountInfo = await this.getDiscount(orderType);
    let discountAmount = discountInfo.amount;
    let serviceCharge = await this.cart.getServiceCharge(
      orderType,
      paymentMethod
    );
    let packagingCharge = await this.cart.getPackagingCharge(
      packagingChargeInfo,
      orderType
    );

    if (discountAmount > 0) {
      message += discountInfo.message + '\n';
    }

    if (packagingCharge > 0) {
      message += 'Packaging Charges = ' + packagingCharge + '\n';
    }

    if (serviceCharge > 0) {
      message += 'Service Charge = ' + serviceCharge;
    }

    if (message != '' && this.discountToast) {
      this.discountToast.dismiss();
      this.discountToast = null;
    }

    if (message) {
      this.showToastMessage(message);
    }
  }

  async showToastMessage(message, duration = 1500) {
    const discountToast = await this.toast.create({
      message: message,
      position: 'middle',
      duration: duration,
      cssClass: 'ion-text-center custom-position newline',
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
    discountToast.onDidDismiss().then(() => {});
    discountToast.present();
    this.discountToast = discountToast;
  }

  setOrderType(orderType) {
    localStorage.setItem('orderType', orderType);
  }

  getOrderType() {
    return localStorage.getItem('orderType');
  }
}
