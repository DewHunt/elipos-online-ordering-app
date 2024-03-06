import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from './../../../auth/services/auth.service';
import { CartService } from './../../../cart/services/cart.service';
import { LoaderService } from './../../../shared/services/loader.service';
import { FreeItemsService } from './../../services/free-items.service';

@Component({
  selector: 'app-free-items',
  templateUrl: './free-items.component.html',
  styleUrls: ['./free-items.component.scss'],
})
export class FreeItemsComponent implements OnInit {
  title: '';
  freeItems: any = [];
  products: any = [];
  subProducts: any = [];
  itemLimit: number = 0;
  message: string;
  showMessage: string = '';
  isCurrentItemIsAdded: boolean = false;
  cartFreeItems: any = [];
  currentProductId: number = 0;
  currentSubProductId: number = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private modalController: ModalController,
    private loaderService: LoaderService,
    private freeItemService: FreeItemsService
  ) {}

  async ngOnInit() {
    console.log('free-items-component');
    await this.cartService.getCartFreeItems().then((data) => {
      this.cartFreeItems = data;
    });
    if (this.freeItems) {
      this.title = this.freeItems.description;
      this.products = this.freeItems.products;
      this.subProducts = this.freeItems.subProducts;
      let addedFreeItem: any = [];
      await this.cartService
        .getCartFreeItemAsItemOfferId(this.freeItems.id)
        .then((data) => {
          addedFreeItem = data;
        });

      if (addedFreeItem) {
        this.showMessage = this.message;
      }

      if (addedFreeItem) {
        this.currentProductId = addedFreeItem['item'].product_id;
        this.currentSubProductId = addedFreeItem['item'].sub_product_id;
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async removeFreeCartItem(item) {
    this.cartService.removeFreeCartItem(item.id);
    this.cartFreeItems = await this.cartService.getCartFreeItems();
    const addedFreeItem = await this.cartService.getCartFreeItemAsItemOfferId(
      this.freeItems.id
    );
    if (!addedFreeItem && this.itemLimit <= this.cartFreeItems.length) {
      this.showMessage = this.message;
    }
    if (addedFreeItem) {
      this.currentProductId = addedFreeItem.item.product_id;
      this.currentSubProductId = addedFreeItem.item.sub_product_id;
    }
    this.freeItemService.freeItemOperation.next({
      freeItemOperation: 'removed',
    });
  }

  async addFeeProductToCart(product) {
    await this.loaderService.showLoader();
    const totalAddedItem = await this.cartService.getTotalFreeItemIsAdded();
    let permissionToAdd = true;
    if (this.itemLimit <= totalAddedItem && this.itemLimit > 1) {
      permissionToAdd = false;
    }
    if (this.itemLimit == 1) {
      await this.cartService.removeFreeCartItems();
    }

    if (permissionToAdd) {
      const addedFreeItem = await this.cartService.getCartFreeItemAsItemOfferId(
        this.freeItems.id
      );
      if (addedFreeItem) {
        await this.cartService.removeFreeCartItem(addedFreeItem.id);
      }
      await this.addProduct(product);
    }
    await this.loaderService.hideLoader();
  }

  async addProduct(product) {
    let itemData = {
      name: product.foodItemName,
      product_id: product.foodItemId,
      sub_product_id: 0,
      regular_price: 0,
      price: 0,
      optionsString: '',
      comment: '',
    };
    this.cartService.insert({
      id: 'freeProduct_' + product.foodItemId + this.freeItems.id,
      isDeals: false,
      item: itemData,
      quantity: 1,
      options: { with: [], without: [] },
      orderType: 'both',
      isFree: true,
      freeDetails: this.freeItems,
    });
    this.cartFreeItems = await this.cartService.getCartFreeItems();

    this.modalController.dismiss();
    this.freeItemService.freeItemOperation.next({ freeItemOperation: 'added' });
  }

  async addFreeSubProductToCart(subProduct) {
    await this.loaderService.showLoader();
    const totalAddedItem: number =
      await this.cartService.getTotalFreeItemIsAdded();
    let permissionToAdd = true;

    if (this.itemLimit <= totalAddedItem && this.itemLimit > 1) {
      permissionToAdd = false;
    }
    if (this.itemLimit == 1) {
      await this.cartService.removeFreeCartItems();
    }
    if (permissionToAdd) {
      const addedFreeItem = await this.cartService.getCartFreeItemAsItemOfferId(
        this.freeItems.id
      );
      if (addedFreeItem) {
        await this.cartService.removeFreeCartItem(addedFreeItem.id);
      }
      await this.addSubProduct(subProduct);
    }
    await this.loaderService.hideLoader();
  }

  async addSubProduct(subProduct) {
    let itemData = {
      name: subProduct.selectiveItemName,
      product_id: subProduct.foodItemId,
      sub_product_id: subProduct.selectiveItemId,
      price: 0,
      optionsString: 'Free',
      comment: '',
    };
    this.cartService.insert({
      id: 'freeSubProduct_' + subProduct.selectiveItemId + this.freeItems.id,
      isDeals: false,
      item: itemData,
      quantity: 1,
      options: null,
      orderType: 'both',
      isFree: true,
      freeDetails: this.freeItems,
    });
    this.cartFreeItems = await this.cartService.getCartFreeItems();
    this.modalController.dismiss();
    this.freeItemService.freeItemOperation.next({ freeItemOperation: 'added' });
  }
}
