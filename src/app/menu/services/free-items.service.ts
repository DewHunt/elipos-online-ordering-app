import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { CartService } from './../../cart/services/cart.service';
import { FreeItemsComponent } from './../components/free-items/free-items.component';
import { MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class FreeItemsService {
  freeItemOperation = new Subject<any>();
  isEnabledFreeItems: boolean = false;
  products: any[];
  subProducts: any = [];
  freeItemsOffer: any = [];
  itemLimit: number = 1;
  message: string;
  isModalIsShown: boolean = false;

  constructor(
    private cartService: CartService,
    private modalCtrl: ModalController,
    private menuService: MenuService
  ) {
    this.menuService.freeItemsOffer.subscribe((data: any) => {
      this.freeItemsOffer = data.freeItems;
      // console.log('data: ', data);
      this.itemLimit = parseInt(data.itemLimit);
      this.message = data.message;
      this.isEnabledFreeItems = data.isFreeItemEnabled;
    });
  }

  async showFreeItemModal() {
    if (this.isEnabledFreeItems) {
      if (this.freeItemsOffer.length > 0) {
        await this.removeCartItemAsAmount();
        const currentOfferItem = await this.getCurrentItemOffer();
        console.log('currentOfferItem: ', currentOfferItem);
        if (currentOfferItem.length > 0) {
          const freeItems = currentOfferItem[currentOfferItem.length - 1];
          const freeItemInCart =
            await this.cartService.getCartFreeItemAsItemOfferId(freeItems.id);
          if (!freeItemInCart) {
            await this.freeItemModal(freeItems);
          }
        }
      }
    }
  }

  async freeItemModal(freeItems) {
    if (!this.isModalIsShown && freeItems) {
      this.isModalIsShown = true;
      let freeItemModal = await this.modalCtrl.create({
        component: FreeItemsComponent,
        backdropDismiss: false,
        cssClass: 'free-items-modal',
        componentProps: {
          freeItems: freeItems,
          itemLimit: this.itemLimit,
          message: this.message,
        },
      });
      freeItemModal.onDidDismiss().then((data) => {
        this.isModalIsShown = false;
        if (data) {
        }
      });
      this.isModalIsShown = true;
      await freeItemModal.present();
    }
  }

  async getCurrentItemOffer() {
    const cartTotal = await this.cartService.getTotalAmount();
    if (this.freeItemsOffer.length > 0) {
      return await this.freeItemsOffer.filter((offerItem) => {
        if (offerItem.amount <= cartTotal) {
          return offerItem;
        }
      });
    } else {
      return [];
    }
  }

  async removeCartItemAsAmount() {
    const cartTotal = await this.cartService.getTotalAmount();
    const cartFreeItems = await this.cartService.getCartFreeItems();
    if (cartFreeItems.length > 0) {
      for (let item of cartFreeItems) {
        if (cartTotal < item.freeDetails.amount) {
          this.cartService.removeFreeCartItem(item.id);
        }
      }
    }
  }

  getIsEnabledFreeItemOffer() {
    return this.isEnabledFreeItems;
  }

  getItemLimit() {
    return this.itemLimit;
  }
}
