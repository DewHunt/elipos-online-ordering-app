import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { WheelSelector } from '@awesome-cordova-plugins/wheel-selector/ngx';
import { AlertController, IonicSlides, ModalController } from '@ionic/angular';
import { AnimationBuilder, AnimationService } from 'css-animator';
import { environment } from 'src/environments/environment';
import { register } from 'swiper/element';
import { AuthService } from './../auth/services/auth.service';
import { CartService } from './../cart/services/cart.service';
import { HomeService } from './../home/services/home.service';
import { LoaderService } from './../shared/services/loader.service';
import { DailyOffersComponent } from './components/daily-offers/daily-offers.component';
import { DealsComponent } from './components/deals/deals.component';
import { HalfAndHalfComponent } from './components/half-and-half/half-and-half.component';
import { ProductModalComponent } from './components/product-modal/product-modal.component';
import { ShopOpenCloseComponent } from './components/shop-open-close/shop-open-close.component';
import { DiscountService } from './services/discount.service';
import { FreeItemsService } from './services/free-items.service';
import { MenuService } from './services/menu.service';
import { ModifierService } from './services/modifier.service';

register();
@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  private animation: AnimationBuilder;
  @ViewChild('swiper', { static: false }) swiper: ElementRef | undefined;
  @ViewChild('categoryOption') categoryOption: any;
  @ViewChild('amountFooter') amountFooter;

  swiperModules = [IonicSlides];
  currentSlideCategoryName: any;
  subProductBlockExpand: boolean = false;
  splash = true;
  isFirstSlide: boolean = true;
  isLastSlide: boolean = false;
  pageTitle: String = 'menu';
  networkStatus: string = 'none';
  menuSegments: string = 'menu';
  loginData = { email: '', password: '' };
  userData: any;
  cartTotal: number;
  totalAmount: number;
  menuData: any;
  selectedItem: any;
  categories: any;
  modifiersAsCategory: any;
  loading: any;
  shopInfo: any;
  shopAddress: any;
  contactNumber: any;
  shopCurrency: string = 'USD';
  shopTiming: any;
  wekDays = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
  };
  selectedCategory: any;
  categoryOptionForm: FormGroup;
  selectOptions: any;
  discountAmount: number = 0;
  dealsCategories: any;
  dealsName: string;
  showSideDishes: any;
  sideDishesAsModifierCategories: any;
  slidesCategory: any = [];
  isDealsAvailable: boolean = false;
  is_buy_get_discount: boolean = false;
  buy_get_id: number = 0;
  buy_qty: number = 0;
  get_qty: number = 0;
  orderType: string = 'collection';
  serviceCharge: number = 0;
  packagingCharge: number = 0;
  cartTotalBuyGetAmount: number = 0;
  serviceChargeInfo: any;
  packagingChargeInfo: any;
  isOrderSubmited = false;
  allSearchableProducts: any = [];
  searchableProductLists: any;
  isShowSearchedProduct = false;
  isShopMaintenanceMode: any;
  isShopClosed: any;
  isShopWeekendOff: any;
  shopClosedMessage = '';
  isOrderEnabled = false;
  isSpecialOfferBtn = true;
  isHasAnyOffers = false;

  categorySelectOptions = {
    header: 'Select A Category',
  };

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private animationService: AnimationService,
    private element: ElementRef,
    private selector: WheelSelector,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private alertController: AlertController,
    private renderer: Renderer2,
    private discountService: DiscountService,
    private cartService: CartService,
    private loaderService: LoaderService,
    private authServiceProvider: AuthService,
    private homeService: HomeService,
    private freeItemService: FreeItemsService,
    private menuService: MenuService,
    private modifierService: ModifierService
  ) {
    console.log('Menu Page: constructor()');
    this.cartTotal = this.cartService.cart.length;
    this.totalAmount = this.cartService.getTotalAmount();
    this.animation = this.animationService.builder();
  }

  async ngOnInit() {
    console.log('Menu Page: ngOnit()');
    await this.loaderService.showLoader();
    await this.getMenuPageReady();
    await this.getShopSettingsInfo();
    await this.loaderService.hideLoader();
    // console.log('this.dealsCategories: ', this.dealsCategories);
    // console.log('this.categories: ', this.categories);
    // console.log('this.allSearchableProducts: ', this.allSearchableProducts);
  }

  async ionViewWillEnter() {
    // console.log('ionViewWillEnter');
    await this.discountService.getDiscountDataFromWeb();
    await this.getShopSettingsInfo();
    await this.shopMaintenanceInit();
    await this.getAllChargesForCart();
  }

  async doRefresh(event) {
    await this.getMenuPageReady();
    await this.homeService.getShopSettingsInfo().subscribe({
      next: async (result) => {
        localStorage.setItem('shopInfo', JSON.stringify(result['data']));
        await this.getShopSettingsInfo();
        await this.shopMaintenanceInit();
      },
      error: (error) => {
        console.log('Error: ', error);
      },
    });
    await this.getAllChargesForCart();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async shopMaintenanceInit() {
    if (this.isShopMaintenanceMode == '1') {
      this.shopClosedMessage = this.shopInfo.shop_maintenance_mode_message;
      await this.showShopOpenClosedModal(
        this.isShopMaintenanceMode,
        false,
        false,
        this.shopClosedMessage,
        `${environment.webUrl}${this.shopInfo.shop_maintenance_mode_image}`
      );
    } else if (
      this.isShopClosed &&
      (await this.getIsPreOreder()) === false &&
      this.isShopWeekendOff === false
    ) {
      this.shopClosedMessage = this.shopInfo.cartPageCheckoutMessage;
      await this.showShopOpenClosedModal(
        '0',
        this.isShopClosed,
        false,
        this.shopClosedMessage,
        `${environment.webUrl}assets/images/sorry-were-closed1.jpg`
      );
    } else if (this.isShopWeekendOff) {
      this.shopClosedMessage = this.shopInfo.shop_weekend_off_message;
      await this.showShopOpenClosedModal(
        '0',
        false,
        this.isShopWeekendOff,
        this.shopClosedMessage,
        `${environment.webUrl}assets/images/sorry-were-closed1.jpg`
      );
    } else {
      this.shopClosedMessage = '';
    }
  }

  async getMenuPageReady() {
    this.orderType = this.discountService.getOrderType();
    this.selectOptions = {
      title: 'Select A Category',
      cssClass: 'product-category-select-block',
    };
    // Let's navigate from TabsPage to Page1
    this.categoryOptionForm = await this.formBuilder.group({
      categoryOptionModel: [0],
    });

    this.cartTotal = await this.cartService.getTotalItem();
    this.totalAmount = await this.cartService.getTotalAmount();
    this.networkStatus = await this.authServiceProvider.getNetworkStatus();

    if (this.networkStatus !== 'none') {
      this.menuData = await this.menuService.getMenuDataFromLocal();
      console.log('this.menuData: ', this.menuData);
      if (this.menuData) {
        this.dealsCategories = await this.menuData.dealsCategories;
        this.dealsName = await this.menuData.dealsName;
        this.categories = await this.menuData.categories;
        this.sideDishesAsModifierCategories = await this.menuData
          .allSideDishesAsModifierCategory;
        this.showSideDishes = await this.menuData.showSideDishes;

        this.modifierService.modifierSideDishesAsModifierCategories =
          this.sideDishesAsModifierCategories;
        this.modifierService.modifierShowSideDishes = this.showSideDishes;
        if (this.dealsCategories) {
          if (this.dealsCategories.length) {
            this.currentSlideCategoryName = this.dealsName;
            this.slidesCategory.push({
              name: this.dealsName,
              id: 'deals',
            });
            this.isDealsAvailable = true;
          }
        }
        if (this.categories) {
          if (this.categories.length > 0) {
            for (let category of this.categories) {
              this.slidesCategory.push({
                name: category.categoryName,
                id: category.categoryId,
              });
            }
          }
        }
        if (this.slidesCategory.length > 0) {
          this.currentSlideCategoryName = this.slidesCategory[0].name;
        }

        const freeOfferDetails = await this.menuData.freeItemsDetails;
        // console.log('freeOfferDetails: ', freeOfferDetails);
        if (freeOfferDetails) {
          this.menuService.freeItemsOffer.next({
            isFreeItemEnabled: freeOfferDetails.isFreeItemEnabled,
            freeItems: freeOfferDetails.freeItems,
            itemLimit: freeOfferDetails.itemLimit,
            message: freeOfferDetails.message,
          });
        }
        await this.getSearchableProducts();
      }
    }
    this.selectedCategory = 0;
    this.changeDetectorRef.detectChanges();

    await this.discountService.getDiscountDataFromWeb();
    await this.cartService.getCartItems.subscribe(async (cartItems) => {
      const view = this.router.url;
      if (view !== '/FreeItemsPage') {
        console.log('Free Item Page');
        await this.freeItemService.showFreeItemModal();
      }
    });
  }

  async getShopSettingsInfo() {
    // console.log('Get Settings Info');
    this.shopInfo = await this.homeService.getShopSettingsInfoFromLocal();
    // console.log('this.shopInfo: ', this.shopInfo);
    this.shopAddress = this.shopInfo.shop_address;
    this.contactNumber = this.shopInfo.shop_contact;
    this.shopTiming = this.shopInfo.shop_timings;
    this.serviceChargeInfo = this.shopInfo.service_charge;
    this.packagingChargeInfo = this.shopInfo.packaging_charge;
    this.isSpecialOfferBtn = this.shopInfo.dailySpecialOffers.isActiveBtn;
    this.isHasAnyOffers = this.shopInfo.dailySpecialOffers.isHasAnyOffers;

    this.isShopMaintenanceMode = this.shopInfo.is_shop_maintenance_mode;
    this.isShopClosed = this.shopInfo.is_shop_closed;
    this.isShopWeekendOff = this.shopInfo.is_shop_weekend_off;
    this.isOrderEnabled = this.shopInfo.isOrderEnabled;
    if (this.isShopMaintenanceMode === '0') {
      await this.getIsPreOreder();
    }
  }

  async showShopOpenClosedModal(
    isShopMaintenanceMode,
    isShopClosed,
    isShopWeekendOff,
    message,
    imageUrl
  ) {
    let shopOpenClosedModal = await this.modalController.create({
      component: ShopOpenCloseComponent,
      backdropDismiss: false,
      cssClass: 'shop-open-closed-modal',
      componentProps: {
        isShopMaintenanceMode,
        isShopClosed,
        isShopWeekendOff,
        message,
        imageUrl,
      },
    });
    shopOpenClosedModal.onDidDismiss().then((dismissalData) => {
      const { data, role } = dismissalData;
      if (data) {
        this.isOrderEnabled = data.isPreOrder;
      }
    });
    shopOpenClosedModal.present();
  }

  async getIsPreOreder() {
    let isPreOrder = await JSON.parse(
      localStorage.getItem('isPreOrder') || '{}'
    );
    if (Object.keys(isPreOrder).length > 0) {
      if (this.isShopClosed) {
        if (isPreOrder.status) {
          this.isOrderEnabled = true;
          return true;
        } else {
          this.isOrderEnabled = false;
          return false;
        }
      }
    }
    const isPreOrderStatus = { status: false };
    await localStorage.setItem('isPreOrder', JSON.stringify(isPreOrderStatus));
    return false;
  }

  async getSearchableProducts() {
    // console.log('this.dealsCategories: ', this.dealsCategories);
    if (this.dealsCategories) {
      await this.dealsCategories.forEach((dealsCategory) => {
        // console.log('dealsCategory: ', dealsCategory);
        dealsCategory.deals.forEach((dealData) => {
          dealData.dealsCategory = dealsCategory;
          dealData.isDealProduct = 1;
          this.allSearchableProducts.push(dealData);
        });
      });
    }

    if (this.categories) {
      await this.categories.forEach(async (category) => {
        await category.products.forEach((product) => {
          product.category = category;
          product.isDealProduct = 0;
          this.allSearchableProducts.push(product);
        });
      });
    }
    // console.log('this.allSearchableProducts: ', this.allSearchableProducts);
  }

  search(event: Event) {
    let searchText = (event.target as HTMLInputElement).value;
    console.log('searchText: ', searchText);
    if (searchText) {
      searchText = searchText.toLowerCase();
      const predicate = (searchData) =>
        searchData?.foodItemName?.toLowerCase().indexOf(searchText) > -1 ||
        searchData?.title?.toLowerCase().indexOf(searchText) > -1;
      this.searchableProductLists =
        this.allSearchableProducts.filter(predicate);
      if (this.searchableProductLists.length > 0) {
        this.isShowSearchedProduct = true;
      }
    } else {
      this.isShowSearchedProduct = false;
      this.searchableProductLists = this.allSearchableProducts;
    }
    console.log('this.searchableProductLists: ', this.searchableProductLists);
  }

  async getAllChargesForCart() {
    if (this.orderType == null) {
      this.orderType = this.discountService.getOrderType();
    }
    this.discountAmount = 0;
    this.cartTotal = await this.cartService.getTotalItem();
    this.totalAmount = await this.cartService.getTotalAmount();
    // console.log('this.orderType: ', this.orderType);
    const discountInfo = await this.discountService.getDiscount(this.orderType);
    this.discountAmount = discountInfo.amount;
    // console.log('this.discountAmount: ', this.discountAmount);
    this.serviceCharge = await this.cartService.getServiceCharge(
      this.serviceChargeInfo,
      this.orderType
    );
    this.packagingCharge = await this.cartService.getPackagingCharge(
      this.packagingChargeInfo,
      this.orderType
    );
    this.cartTotalBuyGetAmount = await this.cartService.getTotalBuyGetAmout();
  }

  getElementById(id: string): any {
    this.element.nativeElement.getElementById();
  }

  setAnimation(name: string) {
    this.animation.setType(name).show(this.amountFooter.nativeElement);
  }

  showWheelSelect() {
    const index = this.swiper?.nativeElement.swiper.activeIndex;
    let defaultItem = this.slidesCategory[index];
    this.currentSlideCategoryName = defaultItem.name;
    this.selector
      .show({
        title: 'Chose a category',
        items: [this.slidesCategory],
        displayKey: 'name',
        wrapWheelText: true,
        defaultItems: [{ index: index, value: defaultItem.name }],
      })
      .then(
        (result) => {
          this.changeSlideAsOption(result[0].index);
        },
        (err) => console.log('Error: ', err)
      );
  }

  changeCategoryEvent(index) {
    const categoryIndex = index.target.value;
    if (categoryIndex) {
      this.changeSlideAsOption(categoryIndex);
      this.selectedCategory = categoryIndex;
    }
    this.changeDetectorRef.detectChanges();
  }

  async changeSlideAsOption(categoryIndex) {
    // console.log('categoryIndex: ', categoryIndex);
    // this.slides?.slideNext(500);
    await this.swiper?.nativeElement.swiper.slideTo(categoryIndex, 500, false);
    const isBeginningStatus = this.swiper?.nativeElement.swiper.isBeginning;
    const isEndStatus = this.swiper?.nativeElement.swiper.isEnd;
    const activeIndex = this.swiper?.nativeElement.swiper.activeIndex;

    this.selectedCategory = categoryIndex;
    this.changeDetectorRef.detectChanges();
    this.isFirstSlide = false;
    this.isLastSlide = false;

    if (isBeginningStatus === true) {
      this.isFirstSlide = true;
    }

    if (isEndStatus === true) {
      this.isLastSlide = true;
    }
    this.currentSlideCategoryName = this.slidesCategory[activeIndex].name;
  }

  subProductBlockToggle(className: string) {
    let classElement =
      this.element.nativeElement.getElementsByClassName(className)[0];

    let iconElement =
      classElement.parentNode.getElementsByClassName('iconToggle')[0];

    let iconName = iconElement.getAttribute('name');
    if (iconName === 'chevron-forward-outline') {
      this.renderer.setAttribute(iconElement, 'name', 'chevron-down-outline');
      iconElement.classList.remove('chevron-forward-outline');
      iconElement.classList.add('chevron-down-outline');
    } else if (iconName === 'chevron-down-outline') {
      this.renderer.setAttribute(
        iconElement,
        'name',
        'chevron-forward-outline'
      );
      iconElement.classList.remove('chevron-down-outline');
      iconElement.classList.add('chevron-forward-outline');
    }

    if (classElement.style.display === 'none') {
      this.renderer.setStyle(classElement, 'display', 'block');
      this.renderer.setStyle(classElement, 'transition', 'all 2s linear');
    } else {
      this.renderer.setStyle(classElement, 'display', 'none');
      this.renderer.setStyle(classElement, 'transition', 'all 2s linear');
    }
  }

  selectedTabs() {
    this.pageTitle = this.menuSegments;
  }

  async addProductToCart($event, product, category) {
    console.log('Add Product To Cart');
    if (this.isOrderEnabled) {
      // console.log('product: ', product);
      // console.log('category: ', category);
      let productOrderType = category.order_type;
      if (!productOrderType) {
        productOrderType = 'both';
        category.order_type = productOrderType;
      }

      let checkOrderType = await this.isShowOrderTypeAlert(productOrderType);
      if (checkOrderType) {
        await this.checkProductOrderType(productOrderType);
      } else {
        await this.productAddToCartModal(product, category);
      }
    }
  }

  async addDealToCart($event, deal, category) {
    console.log('Add Deal To Cart');
    if (this.isOrderEnabled) {
      let productOrderType = category.order_type;
      if (!productOrderType) {
        productOrderType = 'both';
        category.order_type = productOrderType;
      }

      let checkOrderType = await this.isShowOrderTypeAlert(productOrderType);
      if (checkOrderType) {
        await this.checkProductOrderType(productOrderType);
      } else {
        setTimeout(async () => {
          if (deal.is_half_and_half === '1') {
            await this.openHalfDealModal(deal, category);
          } else {
            await this.openDealModal(deal, category);
          }
        }, 100);
      }
    }
  }

  async openDailySpecialOffer() {
    console.log('Daily special Offers');
    let specialOfferModal = await this.modalController.create({
      component: DailyOffersComponent,
      backdropDismiss: false,
      cssClass: 'special-offers-modal',
      componentProps: {},
    });
    specialOfferModal.onDidDismiss().then((dismissalData) => {});
    specialOfferModal.present();
  }

  async openHalfDealModal(deal, category) {
    let halfModal = await this.modalController.create({
      component: HalfAndHalfComponent,
      backdropDismiss: false,
      cssClass: 'half-and-half-modal',
      componentProps: {
        deal: deal,
        category: category,
        sideDishesAsModifierCategories: this.sideDishesAsModifierCategories,
      },
    });
    halfModal.onDidDismiss().then(async (dismissalData) => {
      const { data, role } = dismissalData;
      if (data) {
        let nowDate = Date.now();
        let dealsDetails = {
          title: data.deal.title,
          price: data.price,
        };
        if (data.deal.hasOwnProperty('dealsCategory')) {
          delete data.deal.dealsCategory;
        }
        await this.cartService.insert({
          id: 'deal_' + deal.id + '_' + nowDate,
          isDeals: true,
          dealsDetails: dealsDetails,
          itemDetails: data.dealDetails,
          deal: data.deal,
          quantity: 1,
          price: data.price,
          productText: data.productText,
          orderType: category.order_type,
        });
        await this.getAllChargesForCart();
        // this.setAnimation('shake');
      }
    });
    halfModal.present();
  }

  async openDealModal(deal, category) {
    console.log('Open Deal Modal');
    // console.log('deal: ', deal);
    // await this.loaderService.showLoader();
    let dealModal = await this.modalController.create({
      component: DealsComponent,
      backdropDismiss: false,
      cssClass: 'view-deals-modal',
      componentProps: {
        deal: deal,
        category: category,
        sideDishesAsModifierCategories: this.sideDishesAsModifierCategories,
        showSideDishes: this.showSideDishes,
      },
    });
    dealModal.onDidDismiss().then(async (dismissalData) => {
      const { data, role } = dismissalData;
      // console.log('data: ', data);
      if (data) {
        let nowDate = Date.now();
        let dealsDetails = {
          title: data.deal.title,
          price: data.price,
          comment: data.comment,
        };
        if (data.deal.hasOwnProperty('dealsCategory')) {
          delete data.deal.dealsCategory;
        }
        await this.cartService.insert({
          id: 'deal_' + deal.id + '_' + nowDate,
          isDeals: true,
          is_category_discount: '0',
          is_item_discount: '0',
          is_deals_discount: parseInt(deal.is_discount),
          dealsDetails: dealsDetails,
          itemDetails: data.dealDetails,
          deal: data.deal,
          quantity: 1,
          price: data.price,
          productText: data.productText,
          orderType: category.order_type,
          buy_get_amount: 0,
        });
        await this.getAllChargesForCart();
        // this.setAnimation('shake');
      }
    });
    dealModal.present();
  }

  getOptionsString(options: any, isWithout: boolean): string {
    let optionsString: string = '';
    let optionsPrice: number = 0;
    let name: string;
    if (options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        optionsPrice = optionsPrice + parseFloat(options[i].UnitPrice);
        name = isWithout
          ? 'No ' + options[i].SideDishesName
          : options[i].SideDishesName;
        optionsString =
          i > 0 ? optionsString + ' , ' + name : optionsString + name;
      }
    }

    return optionsString;
  }

  getOptionsPrice(options: any): number {
    let optionsPrice: number = 0;

    if (options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        optionsPrice = optionsPrice + parseFloat(options[i].UnitPrice);
      }
    }
    return optionsPrice;
  }

  async addToCart(
    product: any,
    category: any,
    sub_product: any,
    options: any,
    comment: string
  ) {
    let optionsPrice: number = 0;
    let optionsString: string;
    let optionsStringWith: string;
    let optionsStringWithout: string;
    let withOptions = options.with;
    let withoutOptions = options.without;

    optionsStringWith =
      withOptions.length > 0 ? this.getOptionsString(withOptions, false) : '';
    optionsStringWithout =
      withoutOptions.length > 0
        ? await this.getOptionsString(withoutOptions, true)
        : '';
    optionsString = optionsStringWith
      ? optionsStringWithout
        ? optionsStringWith + ',' + optionsStringWithout
        : optionsStringWith
      : optionsStringWithout;

    optionsPrice = await this.getOptionsPrice(withOptions);

    let orderType = product.order_type;
    let currentOrderType: string = await this.discountService.getOrderType();
    let buyGetForCategory: any = category.buy_and_get;
    let buyGetForProduct: any = product.buy_and_get;
    await this.setBuyAndGetInfoForCart(
      buyGetForCategory,
      buyGetForProduct,
      currentOrderType
    );

    if (sub_product != null) {
      let itemData = {
        name: sub_product.selectiveItemName,
        product_id: product.foodItemId,
        category_id: product.categoryId,
        sub_product_id: sub_product.selectiveItemId,
        price: parseFloat(sub_product.takeawayPrice) + optionsPrice,
        regular_price: parseFloat(sub_product.takeawayPrice),
        optionsString: optionsString,
        comment: comment,
        printedDescription: sub_product.selection_item_printed_description,
      };
      await this.cartService.insert({
        id:
          'sub_product_' +
          sub_product.selectiveItemId +
          optionsString +
          comment,
        isDeals: false,
        item: itemData,
        quantity: 1,
        options: options,
        orderType: orderType,
        is_category_discount: category.isDiscount,
        is_item_discount: product.isDiscount,
        is_deals_discount: 0,
        is_buy_get_discount: this.is_buy_get_discount,
        buy_get_id: this.buy_get_id,
        buy_qty: this.buy_qty,
        get_qty: this.get_qty,
        free_item_qty: 0,
        buy_get_amount: 0,
      });
      await this.getAllChargesForCart();
    } else {
      let itemData = {
        name: product.foodItemName,
        product_id: product.foodItemId,
        category_id: product.categoryId,
        sub_product_id: 0,
        price: parseFloat(product.takeawayPrice) + optionsPrice,
        regular_price: parseFloat(product.takeawayPrice),
        optionsString: optionsString,
        comment: comment,
        printedDescription: product.food_item_printed_description,
      };
      await this.cartService.insert({
        id: 'product_' + product.foodItemId + optionsString + comment,
        isDeals: false,
        item: itemData,
        quantity: 1,
        options: options,
        orderType: orderType,
        is_category_discount: category.isDiscount,
        is_item_discount: product.isDiscount,
        is_deals_discount: 0,
        is_buy_get_discount: this.is_buy_get_discount,
        buy_get_id: this.buy_get_id,
        buy_qty: this.buy_qty,
        get_qty: this.get_qty,
        free_item_qty: 0,
        buy_get_amount: 0,
      });
      await this.getAllChargesForCart();
    }
    if (this.is_buy_get_discount === true) {
      await this.cartService.updateCartForBuyAndGetAmount(
        category.categoryId,
        this.buy_get_id
      );
    }
  }

  setBuyAndGetInfoForCart(
    buyGetForCategory,
    buyGetForProduct,
    currentOrderType
  ) {
    this.is_buy_get_discount = false;
    this.buy_get_id = 0;
    this.buy_qty = 0;
    this.get_qty = 0;

    if (
      Object.keys(buyGetForProduct).length > 0 &&
      buyGetForProduct.buy_get_order_type == currentOrderType
    ) {
      this.is_buy_get_discount = true;
      this.buy_get_id = buyGetForProduct.buy_get_id;
      this.buy_qty = buyGetForProduct.buy_qty;
      this.get_qty = buyGetForProduct.get_qty;
    } else if (
      Object.keys(buyGetForCategory).length > 0 &&
      buyGetForCategory.buy_get_order_type == currentOrderType &&
      Object.keys(buyGetForProduct).length > 0 &&
      buyGetForProduct.buy_get_order_type == currentOrderType
    ) {
      this.is_buy_get_discount = true;
      this.buy_get_id = buyGetForProduct.buy_get_id;
      this.buy_qty = buyGetForProduct.buy_qty;
      this.get_qty = buyGetForProduct.get_qty;
    } else if (Object.keys(buyGetForCategory).length > 0) {
      this.is_buy_get_discount = true;
      this.buy_get_id = buyGetForCategory.buy_get_id;
      this.buy_qty = buyGetForCategory.buy_qty;
      this.get_qty = buyGetForCategory.get_qty;
    }
  }

  async productAddToCartModal(product: any, category: any) {
    let sideDishesAsModifierCategory =
      await this.modifierService.getAssignedModifiersAsProduct(
        product.foodItemId
      );
    if (sideDishesAsModifierCategory.length <= 0) {
      sideDishesAsModifierCategory =
        await this.modifierService.getAssignedModifiersAsProductCategory(
          product.categoryId
        );
    }

    if (sideDishesAsModifierCategory.length > 0) {
      let profileModal = await this.modalController.create({
        component: ProductModalComponent,
        backdropDismiss: false,
        cssClass: 'view-product-modal',
        componentProps: {
          product: product,
          subProduct: null,
          category: category,
          sideDishesAsModifierCategory: sideDishesAsModifierCategory,
        },
      });

      profileModal.onDidDismiss().then(async (dismissalData) => {
        const { data, role } = dismissalData;
        if (data) {
          let productDetails = data.product;
          productDetails.order_type = category.order_type;
          await this.addToCart(
            productDetails,
            category,
            null,
            data.options,
            data.comment
          );
        }
      });
      profileModal.present();
    } else {
      let productDetails = product;
      productDetails.order_type = category.order_type;
      await this.addToCart(
        productDetails,
        category,
        null,
        { with: [], without: [] },
        ''
      );
      // add direct product
    }
  }

  async subProductAddToCartModal(
    $event,
    product: any,
    subProduct: any,
    category: any
  ) {
    console.log('Sub Product Add To Cart Modal');
    if (this.isOrderEnabled) {
      let productOrderType = category.order_type;
      if (!productOrderType) {
        productOrderType = 'both';
        category.order_type = productOrderType;
      }

      let checkOrderType = await this.isShowOrderTypeAlert(productOrderType);

      if (checkOrderType) {
        await this.checkProductOrderType(category.order_type);
      } else {
        let sideDishesAsModifierCategory =
          await this.modifierService.getAssignedModifiersAsSubProduct(
            subProduct.selectiveItemId
          );
        if (sideDishesAsModifierCategory.length <= 0) {
          sideDishesAsModifierCategory =
            await this.modifierService.getAssignedModifiersAsProduct(
              product.foodItemId
            );
          if (sideDishesAsModifierCategory.length <= 0) {
            sideDishesAsModifierCategory =
              await this.modifierService.getAssignedModifiersAsProductCategory(
                product.categoryId
              );
          }
        }

        if (sideDishesAsModifierCategory.length > 0) {
          let profileModal = await this.modalController.create({
            component: ProductModalComponent,
            backdropDismiss: false,
            cssClass: 'view-product-modal',
            componentProps: {
              product: product,
              subProduct: subProduct,
              category: category,
              sideDishesAsModifierCategory: sideDishesAsModifierCategory,
            },
          });
          profileModal.onDidDismiss().then(async (dismissalData) => {
            const { data, role } = dismissalData;
            console.log('data: ', data);
            if (data) {
              let productDetails = data.product;
              productDetails.order_type = category.order_type;
              await this.addToCart(
                productDetails,
                category,
                data.subProduct,
                data.options,
                data.comment
              );
            }
          });
          profileModal.present();
        } else {
          let productDetails = product;
          productDetails.order_type = category.order_type;
          await this.addToCart(
            productDetails,
            category,
            subProduct,
            { with: [], without: [] },
            ''
          );
        }
      }
    }
  }

  async updateTotalItem(refresher) {
    this.cartTotal = await this.cartService.cart.length;
    this.totalAmount = await this.cartService.getTotalAmount();
    refresher.complete();
  }

  goToCart() {
    this.router.navigate(['/cart'], { replaceUrl: false });
    // this.navCtrl.push('CartPage');
  }

  async slideChanged() {
    let currentIndex: any = this.swiper?.nativeElement.swiper.activeIndex;
    const isBeginningStatus = this.swiper?.nativeElement.swiper.isBeginning;
    const isEndStatus = this.swiper?.nativeElement.swiper.isEnd;
    this.isFirstSlide = false;
    this.isLastSlide = false;

    if (isBeginningStatus) {
      this.isFirstSlide = true;
    }

    if (isEndStatus) {
      this.isLastSlide = true;
    }

    if (this.isLastSlide) {
      currentIndex =
        (await this.swiper?.nativeElement.swiper.slides.length) - 1;
    }
    this.selectedCategory = currentIndex;
    this.changeDetectorRef.detectChanges();

    this.currentSlideCategoryName = this.slidesCategory[currentIndex].name;
    this.categoryOptionForm.controls['categoryOptionModel'].setValue(
      currentIndex
    );
  }

  async checkProductOrderType(productOrderType) {
    if (!productOrderType) {
      productOrderType = 'both';
    }

    let messageAndTitle = await this.getCartAddItemAlertMessage(
      productOrderType
    );
    let message = messageAndTitle.message;
    let title = messageAndTitle.title;

    if (this.cartService.isCartIsValidAsOrderType(productOrderType)) {
      let storageOrderType = await this.discountService.getOrderType();
      if (storageOrderType !== '' && storageOrderType !== null) {
        if (
          productOrderType !== 'both' &&
          productOrderType !== storageOrderType
        ) {
          await this.showOrderTypeAlertToSet(title, message);
        }
      } else {
        // let messageAndTitle=this.getCartAddItemAlertMessage('none');
        title = 'Order Type';

        if (productOrderType == 'both') {
          message = 'Please select a order type';
        } else {
          let messageAndTitle = await this.getCartAddItemAlertMessage(
            productOrderType
          );
          message = messageAndTitle.message;
        }
        await this.showOrderTypeAlertToSet(title, message);
      }
    } else {
      let cartMessage = await this.cartService.getCartValidationAlertMessage(
        productOrderType,
        this.shopInfo.customMessages.cartValidity
      );

      await this.cartService.showCartContainOrderTypeItem(
        title,
        cartMessage.message,
        true
      );
    }
  }

  async isShowOrderTypeAlert(productOrderType) {
    let isOk = false;
    if (!this.shopInfo) {
      this.shopInfo = await JSON.parse(localStorage.getItem('shopInfo'));
    }
    let settingsOrderType = await this.shopInfo.order_settings.order_type;
    let currentOrderType = await this.discountService.getOrderType();
    if (currentOrderType === '' || currentOrderType === null) {
      if (settingsOrderType == 'delivery_and_collection') {
        isOk = true;
      } else if (settingsOrderType == 'delivery') {
        await this.discountService.setOrderType('delivery');
        currentOrderType = 'delivery';
        isOk = false;
      } else {
        await this.discountService.setOrderType('collection');
        currentOrderType = 'collection';
        isOk = false;
      }
    } else {
      if (productOrderType == 'both' || productOrderType == null) {
        isOk = false;
      } else {
        if (productOrderType !== currentOrderType) {
          isOk = true;
        } else {
          isOk = false;
        }
      }
    }
    return isOk;
  }

  async showOrderTypeAlertToSet($title, $message) {
    let isOk = false;
    let alert = await this.alertController.create({
      header: $title,
      message: $message,
      mode: 'ios',
      buttons: [
        {
          text: 'Delivery',
          role: 'cancel',
          handler: async (data) => {
            isOk = false;
            await this.discountService.setOrderType('delivery');
            await this.loaderService.hideLoader();
          },
        },
        {
          text: 'Collection',
          handler: async (data) => {
            await this.discountService.setOrderType('collection');
            if (data) {
              isOk = true;
            }
            await this.loaderService.hideLoader();
          },
        },
      ],
    });

    alert.present();
  }

  getCartAddItemAlertMessage(orderType) {
    let customMessage = this.shopInfo.customMessages.productOrderType;
    if (orderType == 'collection') {
      return {
        title: customMessage.titleDelivery,
        message: customMessage.messageDeliveryProduct,
      };
    } else if (orderType == 'delivery') {
      return {
        title: customMessage.titleCollection,
        message: customMessage.messageCollectionProduct,
      };
    } else if (orderType == 'none') {
      return {
        title: customMessage.titleForSelect,
        message: customMessage.messageForSelect,
      };
    } else {
      return { title: '', message: '' };
    }
  }

  async showOrderTypeAlertToChange($title, $message) {
    let isOk = false;

    let alert = await this.alertController.create({
      header: $title,
      message: $message,
      mode: 'ios',
      cssClass: 'order-type-set-or-change',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (data) => {
            isOk = false;
          },
        },
        {
          text: 'Ok',
          handler: (data) => {
            this.discountService.setOrderType(data);
            if (data) {
              isOk = true;
            }
          },
        },
      ],
      inputs: [
        { type: 'radio', label: 'Collection', value: 'collection' },
        { type: 'radio', label: 'Delivery', value: 'delivery' },
      ],
    });

    alert.present();
  }
}
