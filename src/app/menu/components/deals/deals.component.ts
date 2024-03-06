import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { LoaderService } from './../../../shared/services/loader.service';
import { DealsService } from './../../services/deals.service';
import { ModifierService } from './../../services/modifier.service';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss'],
})
export class DealsComponent implements OnInit {
  public itemsForm: FormGroup;
  @ViewChild('comment') comment: any;
  deal: any;
  category: any;
  sideDishesAsModifierCategories: any;
  showSideDishes: any;
  modifiersAsCategory: any;
  dealTotalPrice: number = 0;
  dealData: any;
  disabledFormControl: any;
  showModifier: any = { opacity: '1', 'pointer-events': 'auto' };
  hideModifier: any = { opacity: '.5', 'pointer-events': 'none' };
  isDealReadyToCard: boolean = false;
  productModifiers: any;
  isShowDealItemsBlock = false;
  isShowModifiersBlock = true;
  modifierLists: any;
  currentItemIndex = 0;
  isCurrentItemModifierOptionsSkippedRecordByItemIdentity: any = [];
  withSelectedModifiers: any = [];

  constructor(
    private element: ElementRef,
    private modifierService: ModifierService,
    private dealsService: DealsService,
    private loaderService: LoaderService,
    private renderer: Renderer2,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private formBuilder: FormBuilder
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    console.log('Deals Component');
    // console.log('this.deal.deals_items: ', this.deal.deals_items);
    this.dealTotalPrice = parseFloat(this.deal.price);
    this.dealsService.dealBasePrice = parseFloat(this.deal.price);
    this.dealsService.baseDealItems = this.deal.deals_items;
    this.modifiersAsCategory = this.sideDishesAsModifierCategories;
    this.modifierService.modifierSideDishesAsModifierCategories =
      this.modifiersAsCategory;
    await this.loaderService.hideLoader(168);
  }

  closeModal() {
    this.modalCtrl.dismiss();
    this.resetDeal();
  }

  resetDeal() {
    this.dealsService.dealDetails = [];
  }

  backToDealItems() {
    this.isShowDealItemsBlock = false;
    this.isShowModifiersBlock = true;
  }

  getNextDealItem(dealItem) {
    let allDealItems = this.deal.deals_items;
    if (dealItem) {
      if (allDealItems) {
        let index = -1;
        let allDealItemLength = allDealItems.length;
        index = allDealItems.findIndex((element) => element.id === dealItem.id);
        if (index >= 0) {
          if (index === allDealItemLength) {
            return null;
          } else {
            return allDealItems[index + 1];
          }
        }
      }
    }
    return null;
  }

  getId(dealItem, product, subProduct): string {
    let identity = '';
    if (subProduct) {
      identity =
        dealItem.id +
        '-' +
        subProduct.foodItemId +
        '-' +
        subProduct.selectiveItemId;
    } else {
      if (product) {
        identity = dealItem.id + '-' + product.foodItemId + '-' + '0';
      }
    }
    return identity;
  }

  dealItemProductToggle(className: string) {
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

  toggleItem(dealItem, product, subProduct) {
    let totalItemQty = this.dealsService.totalProductQuantityInAItem(dealItem);
    let dealItemLimit = parseInt(dealItem.limit);
    let selectedItemProducts = this.dealsService.getItemProducts(dealItem);
    let className = '';
    if (product) {
      className = 'ipc-' + dealItem.id;
    } else if (subProduct) {
      className = 'isc-' + dealItem.id;
    }
    let itemElement = this.element.nativeElement.getElementsByClassName(
      'item-' + dealItem.id
    );
    let dealIcon = this.element.nativeElement.getElementsByClassName(
      'deal-icon-' + dealItem.id
    );
    if (totalItemQty >= dealItemLimit) {
      this.dealItemProductToggle(dealItem.id);
      this.enableDisableAllItemCheckboxes(className, true);
      this.enableSelectedItemCheckboxes(selectedItemProducts);
      this.renderer.setStyle(itemElement[0], 'background', '#008000');
      this.renderer.setStyle(dealIcon[0], 'color', '#ffffff');
      let section = this.element.nativeElement.querySelector(
        '.item-' + dealItem.id + ' h6'
      );
      this.renderer.setStyle(section, 'color', '#ffffff');
      let isModifierCompleted =
        this.dealsService.isItemProductsModifierIsCompleted(dealItem);
      let nextDealItem = this.getNextDealItem(dealItem);
      console.log('nextDealItem: ', nextDealItem);
      if (nextDealItem) {
        this.dealItemProductToggle(nextDealItem.id);
      }
    } else {
      this.enableDisableAllItemCheckboxes(className, false);
      this.renderer.setStyle(itemElement[0], 'background', '#e1e1e2');
      this.renderer.setStyle(dealIcon[0], 'color', '#a42a04');
      let section = this.element.nativeElement.querySelector(
        '.item-' + dealItem.id + ' h6'
      );
      this.renderer.setStyle(section, 'color', '#a42a04');
    }
  }

  enableDisableAllItemCheckboxes(className, status) {
    let itemCheckboxElement =
      this.element.nativeElement.getElementsByClassName(className);
    if (itemCheckboxElement.length > 0) {
      for (let i = 0; i < itemCheckboxElement.length; i++) {
        const checkbox = itemCheckboxElement[i];
        this.renderer.setAttribute(checkbox, 'disabled', status);
      }
    }
  }

  enableSelectedItemCheckboxes(selectedItemProducts) {
    selectedItemProducts.forEach((itemProduct) => {
      let itemProductElement =
        this.element.nativeElement.getElementsByClassName(
          'item-checkbox-' + itemProduct.id
        );
      if (itemProductElement.length > 0) {
        this.renderer.setAttribute(itemProductElement[0], 'disabled', 'false');
      }
    });
  }

  getModifiers(product, subProduct): any {
    let modifiers: any = [];
    let categoryId = 0;

    if (product && subProduct === null) {
      categoryId = product.categoryId;
      modifiers = this.modifierService.getAssignedModifiersAsProduct(
        product.foodItemId
      );
    } else if (subProduct && product === null) {
      categoryId = subProduct.categoryId;
      modifiers = this.modifierService.getAssignedModifiersAsSubProduct(
        subProduct.selectiveItemId
      );
      if (modifiers.length === 0) {
        modifiers = this.modifierService.getAssignedModifiersAsProduct(
          subProduct.foodItemId
        );
      }
    }
    if (modifiers.length === 0) {
      modifiers =
        this.modifierService.getAssignedModifiersAsProductCategory(categoryId);
    }
    return modifiers;
  }

  showModifiers(dealItem, product, subProduct) {
    this.modifierLists = this.getModifiers(product, subProduct);
    if (this.modifierLists.length > 0) {
      this.modifierLists.dealItem = dealItem;
      this.modifierLists.product = product;
      this.modifierLists.subProduct = subProduct;
      let lastModifier = this.modifierLists[this.modifierLists.length - 1];
      this.modifierLists.lastModifier = lastModifier;
      this.isShowDealItemsBlock = true;
      this.isShowModifiersBlock = false;
    }
    this.toggleItem(dealItem, product, subProduct);
  }

  getModifierLists(event: any, dealItem, product, subProduct) {
    let isChecked = event.detail.checked;
    let identity = this.getId(dealItem, product, subProduct);
    let itemQtyClass = 'item-qty-' + identity;
    let itemQtyElement =
      this.element.nativeElement.getElementsByClassName(itemQtyClass);
    let productId = 0;
    let subProductId = 0;
    let className = '';
    if (product == null && subProduct) {
      className = 'isc-' + dealItem.id;
      productId = subProduct.foodItemId;
      subProductId = subProduct.selectiveItemId;
    } else if (subProduct == null && product) {
      className = 'ipc-' + dealItem.id;
      productId = product.foodItemId;
    }
    if (isChecked) {
      if (itemQtyElement.length > 0) {
        this.renderer.setStyle(itemQtyElement[0], 'display', 'block');
      }
      this.dealsService.addDealsItem(dealItem, product, subProduct);
      this.showModifiers(dealItem, product, subProduct);
    } else {
      if (itemQtyElement.length > 0) {
        this.renderer.setStyle(itemQtyElement[0], 'display', 'none');
      }
      this.dealsService.removeDealsItem(dealItem, productId, subProductId);
      this.toggleItem(dealItem, product, subProduct);
    }
    this.isDealReadyToCard = this.dealsService.isDealIsCompleted(
      this.deal.deals_items
    );
    this.getItemQuantity(dealItem, product, subProduct);
  }

  addModifier(
    product,
    subProduct,
    dealItem,
    sideDish,
    assignedModifier = null,
    lastModifier = null
  ) {
    console.log('Add Modifier');
    let isAdded = false;
    let identity = this.getId(dealItem, product, subProduct);
    let modifierLimit = 0;
    let addedModifierQuantity = 0;
    let selectedModifierQuantity = 0;
    let modifierLimits = null;
    let sideDishId = sideDish.SideDishesId;
    let modifierCategoryId = assignedModifier.ModifierCategoryId;
    let assignedModifierLimit = assignedModifier ? assignedModifier.limit : 0;
    sideDish.uniqueId = identity + '-' + sideDish.SideDishesId;
    if (product === null && subProduct) {
      console.log('Add Sub Product Modifier');
      modifierLimits = this.dealsService.getModifierLimitByDealItemSubProduct(
        dealItem.subProductAsModifierLimit,
        subProduct.selectiveItemId
      );
      modifierLimit = parseInt(modifierLimits.limit);
      addedModifierQuantity = this.dealsService.getTotalAddedModifierQuantity(
        dealItem,
        subProduct.foodItemId,
        subProduct.selectiveItemId
      );
      if (modifierLimit === 1 && addedModifierQuantity === 1) {
        /* remove all modifier*/
        this.alterModifier(identity, dealItem, sideDishId);
      }
      if (modifierLimit > addedModifierQuantity) {
        selectedModifierQuantity =
          this.dealsService.getTotalSelectedModifierQuantity(
            dealItem,
            subProduct.foodItemId,
            subProduct.selectiveItemId,
            modifierCategoryId
          );
        if (assignedModifierLimit <= selectedModifierQuantity) {
          this.showOverModifierLimitMessage(
            `${assignedModifier.ModifierCategoryName}! Modifier limit is over`
          );
        } else {
          isAdded = this.dealsService.addItemElementModifier(
            dealItem,
            subProduct.foodItemId,
            subProduct.selectiveItemId,
            sideDish
          );
          addedModifierQuantity =
            this.dealsService.getTotalAddedModifierQuantity(
              dealItem,
              subProduct.foodItemId,
              subProduct.selectiveItemId
            );
        }
      } else {
        this.showOverModifierLimitMessage(
          `${subProduct.selectiveItemName}! Modifier total limit is over`
        );
      }
    } else if (subProduct === null && product) {
      console.log('Add Product Modifier');
      modifierLimits = this.dealsService.getModifierLimitByDealItemProduct(
        dealItem.productAsModifierLimit,
        product.foodItemId
      );
      modifierLimit = parseInt(modifierLimits.limit);
      addedModifierQuantity = this.dealsService.getTotalAddedModifierQuantity(
        dealItem,
        product.foodItemId,
        0
      );
      if (modifierLimit === 1 && addedModifierQuantity === 1) {
        // remove all modifier
        this.alterModifier(identity, dealItem, sideDishId);
      }

      if (modifierLimit > addedModifierQuantity) {
        selectedModifierQuantity =
          this.dealsService.getTotalSelectedModifierQuantity(
            dealItem,
            product.foodItemId,
            0,
            modifierCategoryId
          );
        if (assignedModifierLimit <= addedModifierQuantity) {
          this.showOverModifierLimitMessage(
            `${assignedModifier.ModifierCategoryName}! Modifier limit is over`
          );
        } else {
          isAdded = this.dealsService.addItemElementModifier(
            dealItem,
            product.foodItemId,
            '0',
            sideDish
          );
          addedModifierQuantity =
            this.dealsService.getTotalAddedModifierQuantity(
              dealItem,
              product.foodItemId,
              0
            );
        }
      } else {
        this.showOverModifierLimitMessage(
          `${product.foodItemName}! Modifier total limit is over`
        );
      }
    }

    if (modifierLimit === addedModifierQuantity) {
      if (
        lastModifier.ModifierCategoryId === assignedModifier.ModifierCategoryId
      ) {
        this.backToDealItems();
      }
    }
    this.dealTotalPrice =
      this.dealsService.dealBasePrice +
      this.dealsService.getModifiersTotalPrice();
    return isAdded;
  }

  removeModifier(
    product,
    subProduct,
    dealItem,
    sideDish,
    assignedModifier = null
  ) {
    let modifierLimit = assignedModifier.limit;
    let isRemoved = false;
    let identity = this.getId(dealItem, product, subProduct);
    if (product == null && subProduct) {
      isRemoved = this.dealsService.removeItemElementModifier(
        dealItem,
        subProduct.foodItemId,
        subProduct.selectiveItemId,
        sideDish
      );
    } else if (subProduct == null && product) {
      isRemoved = this.dealsService.removeItemElementModifier(
        dealItem,
        product.foodItemId,
        0,
        sideDish
      );
    }
    this.dealTotalPrice =
      this.dealsService.dealBasePrice +
      this.dealsService.getModifiersTotalPrice();
    return isRemoved;
  }

  getAddedModifier(dealItem, product, subProduct, sideDish) {
    let returnedModifier = null;
    if (product == null && subProduct) {
      returnedModifier = this.dealsService.getItemElementModifier(
        dealItem,
        subProduct.foodItemId,
        subProduct.selectiveItemId,
        sideDish.SideDishesId
      );
    } else if (subProduct == null && product) {
      returnedModifier = this.dealsService.getItemElementModifier(
        dealItem,
        product.foodItemId,
        0,
        sideDish.SideDishesId
      );
    }

    if (returnedModifier) {
      returnedModifier.totalPrice =
        returnedModifier.quantity * Number(returnedModifier.UnitPrice);
    }
    // console.log('returnedModifier: ', returnedModifier);
    return returnedModifier;
  }

  getItemQuantity(dealItem, product, subProduct) {
    let identity = this.getId(dealItem, product, subProduct);
    let itemProducts = this.dealsService.getDealsItemProductsById(dealItem.id);
    let elementIndex = -1;
    if (itemProducts.length > 0) {
      elementIndex = itemProducts.findIndex(
        (element) => element.id == identity
      );
      if (elementIndex >= 0) {
        return itemProducts[elementIndex].quantity;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  }

  addItemQuantity(dealItem, product, subProduct) {
    let identity = this.getId(dealItem, product, subProduct);
    this.dealsService.addProductQuantityInItemProduct(identity, dealItem);

    this.disableProductPlusButton(dealItem);
    this.toggleItem(dealItem, product, subProduct);
    this.setDealsItemProductsIsCompleted(dealItem);
    this.isDealReadyToCard = this.dealsService.isDealIsCompleted(
      this.deal.deals_items
    );
    this.dealTotalPrice =
      this.dealsService.dealBasePrice +
      this.dealsService.getModifiersTotalPrice();
  }

  removeItemQuantity(dealItem, product, subProduct) {
    let identity = this.getId(dealItem, product, subProduct);
    let productLimit = 1;
    let productId = 0;
    let subProductId = 0;
    if (product) {
      productLimit = this.dealsService.getModifierLimitByDealItemProduct(
        dealItem.productAsModifierLimit,
        product.foodItemId
      ).productLimit;
      productId = product.foodItemId;
    } else if (subProduct) {
      productLimit = this.dealsService.getModifierLimitByDealItemProduct(
        dealItem.subProductAsModifierLimit,
        subProduct.selectiveItemId
      ).productLimit;
      subProductId = subProduct.selectiveItemId;
      productId = subProduct.foodItemId;
    }
    let totalQuantity = this.getItemProductQuantity(
      dealItem,
      product,
      subProduct
    );

    if (totalQuantity === 1) {
      let isRemoved = this.dealsService.removeDealsItem(
        dealItem,
        productId,
        subProductId
      );
      if (isRemoved) {
        // unchecked product
        let itemCheckboxClass = 'item-checkbox-' + identity;
        let itemCheckboxElement =
          this.element.nativeElement.getElementsByClassName(itemCheckboxClass);
      }
    } else {
      this.dealsService.removeProductQuantityInItemProduct(
        identity,
        dealItem,
        productLimit
      );
    }

    totalQuantity = this.getItemProductQuantity(dealItem, product, subProduct);

    this.disableProductPlusButton(dealItem);
    this.toggleItem(dealItem, product, subProduct);
    this.setDealsItemProductsIsCompleted(dealItem);
    this.isDealReadyToCard = this.dealsService.isDealIsCompleted(
      this.deal.deals_items
    );
    this.dealTotalPrice =
      this.dealsService.dealBasePrice +
      this.dealsService.getModifiersTotalPrice();
  }

  isDealsCurrentItemIsCompleted() {
    if (
      this.isCurrentItemModifierOptionsSkippedRecordByItemIdentity.length > 0
    ) {
      for (let item of this
        .isCurrentItemModifierOptionsSkippedRecordByItemIdentity) {
        if (!item.isCompleted) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  getItemProductQuantity(dealItem, product, subProduct) {
    let identity = this.getId(dealItem, product, subProduct);

    let itemProducts = this.dealsService.getDealsItemProductsById(dealItem.id);
    let elementIndex = -1;
    if (itemProducts.length > 0) {
      elementIndex = itemProducts.findIndex(
        (element) => element.id == identity
      );
      if (elementIndex >= 0) {
        return itemProducts[elementIndex].quantity;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  }

  disableProductPlusButton(dealItem) {
    let itemProducts = this.dealsService.getItemProducts(dealItem);
    let allProductQty = this.dealsService.totalProductQuantityInAItem(dealItem);
    for (let itemProduct of itemProducts) {
      let id = itemProduct.id;
      let productLimit = itemProduct.limit;
      let productQuantity = itemProduct.quantity;
      let section2 = this.element.nativeElement.querySelector(
        '.product-qty-add-' + id
      );
      if (allProductQty == dealItem.limit) {
        if (section2) {
          this.renderer.setStyle(section2, 'opacity', '.5');
          this.renderer.setStyle(section2, 'pointer-events', 'none');
        }
      } else {
        if (productLimit == productQuantity) {
          if (section2) {
            this.renderer.setStyle(section2, 'opacity', '.5');
            this.renderer.setStyle(section2, 'pointer-events', 'none');
          }
        } else {
          if (section2) {
            this.renderer.setStyle(section2, 'opacity', '1');
            this.renderer.setStyle(section2, 'pointer-events', 'auto');
          }
        }
      }
    }
  }

  setDealsItemProductsIsCompleted(dealItem) {
    let itemProducts = this.dealsService.getDealsItemProductsById(dealItem.id);
    let countProductSelected = 0;
    if (itemProducts.length > 0) {
      countProductSelected =
        this.dealsService.getTotalProductQuantity(itemProducts);
    }
    if (countProductSelected >= dealItem.limit) {
      if (this.isDealsCurrentItemIsCompleted()) {
        this.currentItemIndex = this.currentItemIndex + 1;
        this.isCurrentItemModifierOptionsSkippedRecordByItemIdentity = [];
      }
    }
  }

  alterModifier(identity, dealItem, sideDishId) {
    let isRemoved = this.dealsService.setEmptyModifiersInElementItem(
      identity,
      dealItem
    );
    if (isRemoved) {
      //
    }
  }

  getTotalSelectedModifiers(modifiers, modifierCategoryId) {
    if (modifiers.length > 0) {
      let total = 0;
      modifiers.forEach((element) => {
        if (element.modifierCategoryId === modifierCategoryId) {
          total++;
        }
      });
      return total;
    }
    return 0;
  }

  async showOverModifierLimitMessage(modifierCategoryName) {
    const toast = await this.toastController.create({
      message: modifierCategoryName + '! Modifier limit is over',
      duration: 1500,
      position: 'middle',
      cssClass: 'ion-text-center',
    });
    toast.present();
  }

  addToWithSelectedModifiers(
    identity,
    modifierLimit,
    sideDishesId,
    modifierCategoryId,
    unitPrice
  ) {
    this.withSelectedModifiers.push({
      id: identity,
      modifierLimit: modifierLimit,
      modifiers: [
        {
          id: sideDishesId,
          modifierCategoryId: modifierCategoryId,
          quantity: 1,
          unitPrice: unitPrice,
        },
      ],
    });
  }

  addDealToCart() {
    console.log('add Deal To Cart');
    let deal = this.deal;
    let dealDetails = this.dealsService.dealDetails;
    dealDetails.forEach((detail) => {
      detail.itemProducts.forEach((item) => {
        item.isHalfDeal = false;
      });
    });
    let comment = null;
    let productText = this.dealsService.getProductText();
    let extraModifierPrice = this.dealsService.getModifiersTotalPrice();
    let price = this.dealsService.dealBasePrice + extraModifierPrice;
    let data = {
      deal: deal,
      dealDetails: dealDetails,
      price: price,
      comment: comment,
      productText: productText,
    };
    this.modalCtrl.dismiss(data, 'cancel');
    this.resetDeal();
  }

  showIncompleteItem() {
    let items = this.dealsService.getInCompleteDealsItems();
    if (items.length > 0) {
      let firstItems = items[0];
      for (let item of items) {
        let className = 'item-' + item.id;
        let itemElement =
          this.element.nativeElement.getElementsByClassName(className);
        this.renderer.setStyle(itemElement[0], 'background', 'red');
        let section = this.element.nativeElement.querySelector(
          '.' + className + ' h6'
        );
        if (section) {
          this.renderer.setStyle(section, 'color', '#fff');
        }
      }
      let itemElement = document.getElementById('item-' + firstItems.id);

      itemElement.scrollIntoView();
    }
  }
}
