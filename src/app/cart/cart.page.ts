import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from './../auth/services/auth.service';
import { HomeService } from './../home/services/home.service';
import { DiscountService } from './../menu/services/discount.service';
import { FreeItemsService } from './../menu/services/free-items.service';
import { LoaderService } from './../shared/services/loader.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  pageTitle: string = 'Cart';
  cart = [];
  cartTotalAmount: number = 0;
  cartTotalBuyGetAmount: number = 0;
  shopInfo: any;
  serviceCharge: number = 0;
  packagingCharge: number = 0;
  isShopIsClosed: boolean = true;
  isShopIsMaintenanceMode: boolean = false;
  shopMaintenanceModeMessage: string;
  todayShopTiming: any;
  isDiscountAvailable: boolean = false;
  discountAmount: number = 0;
  discountType: string = 'amount';
  discountPercent: number = 0;
  isCartIsValidFromApi: boolean = false;
  isOrderEnabled = false;
  checkoutButtonText = '';
  shopClosedMessage = '';
  cartPageCheckoutMessage = '';
  offerButtonText: string;
  orderType: string = 'collection';
  serviceChargeInfo: any;
  packagingChargeInfo: any;

  constructor(
    private router: Router,
    private cartService: CartService,
    private discountService: DiscountService,
    private freeItemService: FreeItemsService,
    private loaderService: LoaderService,
    private authServiceProvider: AuthService,
    private homeService: HomeService,
    private navController: NavController
  ) {}

  async ngOnInit() {
    // this.discountService.getDiscountDataFromWeb();
    console.log('this.cart: ', this.cart);
    await this.loaderService.showLoader();
    await this.getShopSettingsInfo();
    await this.freeItemService.freeItemOperation.subscribe(async (res) => {
      console.log('Free Item Operation: ', res);
      this.setOfferButton();
    });
    await this.setOfferButton();
    await this.loaderService.hideLoader();
  }

  goBack() {
    this.router.navigate(['/menu'], { replaceUrl: true });
  }

  async doRefresh(event) {
    await this.homeService.getShopSettingsInfo().subscribe({
      next: async (result) => {
        console.log('result: ', result);
        await localStorage.setItem('shopInfo', JSON.stringify(result['data']));
        await this.getShopSettingsInfo();
      },
      error: (error) => {
        console.log('Error: ', error);
      },
    });
    // await this.discountService.getDiscountDataFromWeb();

    setTimeout(async () => {
      await this.getAllChargesForCart();
      event.target.complete();
    }, 2000);
  }

  async getShopSettingsInfo() {
    this.cart = this.cartService.getCart();
    console.log('this.cart: ', this.cart);
    this.shopInfo = await this.homeService.getShopSettingsInfoFromLocal();
    if (this.shopInfo) {
      this.serviceChargeInfo = this.shopInfo.service_charge;
      this.packagingChargeInfo = this.shopInfo.packaging_charge;
      this.isShopIsClosed = this.shopInfo.is_shop_closed;
      this.isOrderEnabled = this.shopInfo.isOrderEnabled;
      this.checkoutButtonText = this.shopInfo.cartPageCheckoutButtonText;
      this.todayShopTiming = this.shopInfo.today_shop_timing;

      if (this.shopInfo.is_shop_maintenance_mode == '1') {
        console.log('shop maintenance mode');
        this.shopClosedMessage = this.shopInfo.shop_maintenance_mode_message;
      } else if (this.shopInfo.is_shop_closed) {
        this.shopClosedMessage = this.shopInfo.cartPageCheckoutMessage;
      } else if (this.shopInfo.is_shop_weekend_off) {
        this.shopClosedMessage = this.shopInfo.shop_weekend_off_message;
      } else {
        this.shopClosedMessage = '';
      }
      await this.getIsPreOreder();
      await this.getAllChargesForCart();
    }
    await this.checkCartValidFromApi();
  }

  async getIsPreOreder() {
    if (this.isOrderEnabled === false) {
      let isPreOrder = await JSON.parse(
        localStorage.getItem('isPreOrder') || '{}'
      );
      if (Object.keys(isPreOrder).length > 0) {
        if (isPreOrder.status) {
          this.isOrderEnabled = true;
        } else {
          this.isOrderEnabled = false;
        }
      }
    }
  }

  async getAllChargesForCart() {
    this.discountAmount = 0;
    let cart = await this.cartService.getCart();
    let orderType = await this.discountService.getOrderType();
    this.cart = cart;
    this.orderType = orderType;
    this.cartTotalAmount = await this.cartService.getTotalAmount();
    this.cartTotalBuyGetAmount = await this.cartService.getTotalBuyGetAmout();

    const discountInfo = await this.discountService.getDiscount(this.orderType);
    this.discountAmount = discountInfo.amount;
    this.packagingCharge = await this.cartService.getPackagingCharge(
      this.packagingChargeInfo,
      this.orderType
    );
    this.serviceCharge = await this.cartService.getServiceCharge(
      this.serviceChargeInfo,
      this.orderType
    );
    await this.discountService.showDiscountToastMessage(this.orderType);
    await this.cartService.getCartItems.subscribe(async (cartItem) => {
      this.cart = cartItem;
      this.cartTotalAmount = await this.cartService.getTotalAmount();
    });
  }

  async setOfferButton() {
    this.offerButtonText = '';
    // console.log(
    //   'this.freeItemService.getIsEnabledFreeItemOffer(): ',
    //   this.freeItemService.getIsEnabledFreeItemOffer()
    // );

    if (await this.freeItemService.getIsEnabledFreeItemOffer()) {
      const currentOfferItem = await this.freeItemService.getCurrentItemOffer();
      if (currentOfferItem.length > 0) {
        const freeItems = currentOfferItem[currentOfferItem.length - 1];
        const freeItemInCart =
          await this.cartService.getCartFreeItemAsItemOfferId(freeItems.id);
        if (freeItemInCart) {
          this.offerButtonText = 'Update free item';
        } else {
          this.offerButtonText = 'Add new free item';
        }
      }
    }
  }

  async clearCart() {
    await this.cartService.clearCart();
    this.cart = await this.cartService.getCart();

    this.cartTotalAmount = await this.cartService.getTotalAmount();
    this.cartTotalBuyGetAmount = await this.cartService.getTotalBuyGetAmout();
    this.serviceCharge = await this.cartService.getServiceCharge(
      this.serviceChargeInfo,
      this.orderType
    );
    this.packagingCharge = await this.cartService.getPackagingCharge(
      this.packagingChargeInfo,
      this.orderType
    );
    const discountInfo = await this.discountService.getDiscount(this.orderType);
    this.discountAmount = await discountInfo.amount;
  }

  async openOfferModal() {
    if (await this.freeItemService.getIsEnabledFreeItemOffer()) {
      const currentOfferItem = await this.freeItemService.getCurrentItemOffer();
      if (currentOfferItem.length > 0) {
        const freeItems = currentOfferItem[currentOfferItem.length - 1];
        const view = this.router.url;
        if (view !== '/FreeItemsPage') {
          await this.freeItemService.freeItemModal(freeItems);
        }
      }
    }
  }

  async removeItem(index) {
    await this.cartService.removeCartItem(index);
    this.cart = await this.cartService.getCart();
    this.cartTotalAmount = await this.cartService.getTotalAmount();
    const discountInfo = await this.discountService.getDiscount(this.orderType);
    this.discountAmount = discountInfo.amount;
    await this.checkCarrItemAvailAbility();
    await this.setOfferButton();
  }

  async decreaseQuantity(index) {
    let categoryId: any = 0;
    let buyGetId: any = 0;
    let isBuyGetDiscount: boolean = false;
    if (this.cartService.cart[index].quantity > 0) {
      this.cartService.cart[index].quantity -= 1;
    }

    await this.cartService.setCart(this.cartService.cart);

    isBuyGetDiscount = this.cartService.cart[index].is_buy_get_discount;
    if (isBuyGetDiscount === true) {
      categoryId = this.cartService.cart[index].item.category_id;
      buyGetId = this.cartService.cart[index].buy_get_id;
      await this.cartService.updateCartForBuyAndGetAmount(categoryId, buyGetId);
    }

    this.cart = await this.cartService.getCart();
    this.cartTotalAmount = await this.cartService.getTotalAmount();

    if (this.cartService.cart[index].quantity == 0) {
      await this.removeItem(index);
    }

    const discountInfo = await this.discountService.getDiscount(this.orderType);
    this.discountAmount = discountInfo.amount;
    this.cartTotalBuyGetAmount = await this.cartService.getTotalBuyGetAmout();
    await this.discountService.showDiscountToastMessage(this.orderType);
    this.serviceCharge = await this.cartService.getServiceCharge(
      this.serviceChargeInfo,
      this.orderType
    );
    this.packagingCharge = await this.cartService.getPackagingCharge(
      this.packagingChargeInfo,
      this.orderType
    );

    await this.setOfferButton();
  }

  async increaseQuantity(index) {
    if (
      !(
        this.cartService.cart[index].hasOwnProperty('isFree') &&
        this.cartService.cart[index].isFree
      )
    ) {
      let categoryId: any = 0;
      let buyGetId: any = 0;
      let isBuyGetDiscount: boolean = false;
      this.cartService.cart[index].quantity += 1;
      await this.cartService.setCart(this.cartService.cart);
      isBuyGetDiscount = this.cartService.cart[index].is_buy_get_discount;
      if (isBuyGetDiscount === true) {
        categoryId = this.cartService.cart[index].item.category_id;
        buyGetId = this.cartService.cart[index].buy_get_id;
        await this.cartService.updateCartForBuyAndGetAmount(
          categoryId,
          buyGetId
        );
      }

      this.cart = await this.cartService.getCart();
      this.cartTotalAmount = await this.cartService.getTotalAmount();
      const discountInfo = await this.discountService.getDiscount(
        this.orderType
      );
      this.discountAmount = discountInfo.amount;
      this.cartTotalBuyGetAmount = await this.cartService.getTotalBuyGetAmout();
      await this.discountService.showDiscountToastMessage(this.orderType);
      this.serviceCharge = await this.cartService.getServiceCharge(
        this.serviceChargeInfo,
        this.orderType
      );
      this.packagingCharge = await this.cartService.getPackagingCharge(
        this.packagingChargeInfo,
        this.orderType
      );
      await this.setOfferButton();
    }
  }

  checkCarrItemAvailAbility() {
    let allAvailable = true;
    for (let item of this.cart) {
      if (!item.isAvailable) {
        allAvailable = false;
      }
    }
    this.isCartIsValidFromApi = allAvailable;
  }

  async checkCartValidFromApi() {
    let cart_data = await this.cartService.getCart();
    const data = {
      cart_data: cart_data,
      user: await this.authServiceProvider.getUserData(),
    };
    await this.cartService.checkCartValidity(data).subscribe({
      next: async (result) => {
        this.isCartIsValidFromApi = result.isCartIsValid;
        if (!this.isCartIsValidFromApi) {
          let unAvailableProducts = result.unAvailableProducts;
          for (let cartItem of unAvailableProducts) {
            let index = this.cart.findIndex(
              (element) => element.id == cartItem.itemId
            );
            if (index > -1) {
              this.cart[index].isAvailable = false;
            }
          }
          await this.cartService.setCart(this.cart);
          await this.cartService.showCartProductIsUpdated(result.message);

          await this.checkCarrItemAvailAbility();
        }
      },
      error: async (error) => {
        console.log('Error: ', error);
      },
    });
  }

  async goToCheckout() {
    let orderType = await this.discountService.getOrderType();
    if (await this.cartService.isCartIsValidAsOrderType(orderType)) {
      if (!(await this.authServiceProvider.isLogged())) {
        await localStorage.setItem('redirectPage', 'checkout');
        this.router.navigate(['/login'], { replaceUrl: true });
      } else {
        await localStorage.setItem('redirectPage', '');
        this.router.navigate(['/checkout'], { replaceUrl: true });
      }
    } else {
      await this.discountService.showToastMessage(
        'your cart contain only ' + orderType + ' order'
      );
    }
  }
}
