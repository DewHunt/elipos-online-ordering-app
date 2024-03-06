import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { LoaderService } from './../../../shared/services/loader.service';
import { DealsService } from './../../services/deals.service';
import { ModifierService } from './../../services/modifier.service';

@Component({
  selector: 'app-half-and-half',
  templateUrl: './half-and-half.component.html',
  styleUrls: ['./half-and-half.component.scss'],
})
export class HalfAndHalfComponent implements OnInit {
  public itemsForm: FormGroup;
  @ViewChild('comment') comment: any;
  deal: any;
  category: any;
  sideDishesAsModifierCategories: any;
  dealItems: any;
  products: any;
  subProducts: any;
  firstHalfSubProducts: any = [];
  secondHalfSubProducts: any = [];
  firstHalfAssignedModifiers: any = [];
  secondHalfAssignedModifiers: any = [];
  withSelectedModifiers: any = { firstHalf: [], secondHalf: [] };
  halfAndHalfDeals: any = {
    firstHalf: {
      portion: 'First Half',
      quantity: 1,
      product: [],
      subProduct: [],
      modifiers: [],
    },
    secondHalf: {
      portion: 'Second Half',
      quantity: 1,
      product: [],
      subProduct: [],
      modifiers: [],
    },
  };
  isShowFirstHalfProduct = false;
  isShowSecondHalfProduct = true;
  isShowFirstHalfSubProduct = true;
  isShowSecondHalfSubProduct = true;
  isShowFirstHalfModifier = true;
  isShowSecondHalfModifier = true;
  firstHalfPortionBtnColor = 'dark';
  previousSelectedFirstHalfProductId: any;
  previousSelectedSecondHalfProductId: any;
  previousSelectedFirstHalfSubProductId: any;
  previousSelectedSecondHalfSubProductId: any;
  isSelectedFirstHalfSubProduct = false;
  isSelectedSecondHalfSubProduct = false;
  isSelectedFirstHalfModifier = false;
  isSelectedSecondHalfModifier = false;
  firstHalfSubProductPrice = 0;
  firstHalfModifierPrice = 0;
  firstHalfTotalPrice = 0;
  secondHalfSubProductPrice = 0;
  secondHalfModifierPrice = 0;
  secondHalfTotalPrice = 0;
  finalPrice = 0;
  firstHalfTitleText: any;
  firstHalfSubProductText: any;
  secondHalfTitleText: any;
  secondHalfSubProductText: any;
  selectedFirstHalfSubProductSizeId: any;

  constructor(
    private loaderService: LoaderService,
    private modalController: ModalController,
    private element: ElementRef,
    private renderer: Renderer2,
    private modifierService: ModifierService,
    private toastController: ToastController,
    private dealsService: DealsService
  ) {}

  async ngOnInit() {
    await this.loaderService.showLoader();
    this.dealItems = this.deal.deals_items[0];
    this.products = this.dealItems.products;
    this.subProducts = this.dealItems.subProducts;
    await this.loaderService.hideLoader();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  firstHalfPortion() {
    console.log('firstHalfPortion()');
    this.isSelectedSecondHalfSubProduct = false;
    this.firstHalfPortionBtnColor = 'dark';
    if (this.isSelectedFirstHalfModifier === true) {
      this.isShowFirstHalfProduct = true;
      this.isShowFirstHalfSubProduct = true;
      this.isShowFirstHalfModifier = false;
    } else if (this.isSelectedFirstHalfSubProduct === true) {
      this.isShowFirstHalfProduct = true;
      this.isShowFirstHalfSubProduct = false;
      this.isShowFirstHalfModifier = true;
    } else {
      this.isShowFirstHalfProduct = false;
      this.isShowFirstHalfSubProduct = true;
      this.isShowFirstHalfModifier = true;
    }
    this.isShowSecondHalfProduct = true;
    this.isShowSecondHalfSubProduct = true;
    this.isShowSecondHalfModifier = true;
  }

  secondHalfPortion() {
    console.log('secondHalfPortion()');
    this.firstHalfPortionBtnColor = 'tertiary';
    this.isShowFirstHalfProduct = true;
    this.isShowFirstHalfSubProduct = true;
    if (this.isSelectedSecondHalfModifier === true) {
      this.isShowSecondHalfProduct = true;
      this.isShowSecondHalfSubProduct = true;
      this.isShowSecondHalfModifier = false;
    } else if (this.isSelectedSecondHalfSubProduct === true) {
      this.isShowSecondHalfProduct = true;
      this.isShowSecondHalfSubProduct = false;
      this.isShowSecondHalfModifier = true;
    } else {
      this.isShowSecondHalfProduct = false;
      this.isShowSecondHalfSubProduct = true;
      this.isShowSecondHalfModifier = true;
    }
    this.isShowFirstHalfModifier = true;
  }

  backToFirstHalfProducts() {
    console.log('backToFirstHalfProducts()');
    this.isShowFirstHalfProduct = false;
    this.isShowFirstHalfSubProduct = true;
    this.isShowSecondHalfProduct = true;
    this.isShowSecondHalfSubProduct = true;
    this.isShowSecondHalfModifier = true;
  }

  backToSecondHalfProducts() {
    console.log('backToSecondHalfProducts()');
    this.isSelectedSecondHalfSubProduct = false;
    this.isShowFirstHalfProduct = true;
    this.isShowFirstHalfSubProduct = true;
    this.isShowSecondHalfProduct = false;
    this.isShowSecondHalfSubProduct = true;
    this.isShowSecondHalfModifier = true;
  }

  backToFirstHalfSubProducts() {
    console.log('backToFirstHalfSubProducts()');
    this.isShowFirstHalfProduct = true;
    this.isShowFirstHalfSubProduct = false;
    this.isShowSecondHalfProduct = true;
    this.isShowSecondHalfSubProduct = true;
    this.isShowFirstHalfModifier = true;
  }

  backToSecondHalfSubProducts() {
    console.log('backToSecondHalfSubProducts()');
    this.isShowFirstHalfProduct = true;
    this.isShowFirstHalfSubProduct = true;
    this.isShowSecondHalfProduct = true;
    this.isShowSecondHalfSubProduct = false;
    this.isShowSecondHalfModifier = true;
  }

  addHalfDealToCart() {
    console.log('addHalfDealToCart()');
    this.halfAndHalfDeals.productText =
      this.firstHalfTitleText + ' + ' + this.secondHalfTitleText;
    if (this.halfAndHalfDeals.productText) {
      this.halfAndHalfDeals.productText =
        this.firstHalfSubProductText + ' + ' + this.secondHalfSubProductText;
    }
    let itemProducts = [];
    itemProducts.push(this.halfAndHalfDeals.firstHalf);
    itemProducts.push(this.halfAndHalfDeals.secondHalf);
    let dealDetails = [
      {
        isHalfDeal: true,
        productsText: this.halfAndHalfDeals.productText,
        id: this.dealItems.id,
        title: this.dealItems.title,
        description: this.dealItems.title,
        limit: this.dealItems.limit,
        dealsId: this.dealItems.dealsId,
        itemProducts: itemProducts,
      },
    ];
    console.log('this.finalPrice: ', this.finalPrice);
    let data = {
      deal: this.deal,
      dealDetails: dealDetails,
      price: this.finalPrice,
      productText: this.halfAndHalfDeals.productText,
    };
    this.modalController.dismiss(data, 'cancel');
  }

  firstHalfProduct(product) {
    console.log('fh - product: ', product);
    let productId = product.foodItemId;
    if (this.previousSelectedFirstHalfProductId) {
      let previousSelectedElement =
        this.element.nativeElement.getElementsByClassName(
          'fhp-id-' + this.previousSelectedFirstHalfProductId
        );
      if (previousSelectedElement.length > 0) {
        this.renderer.setAttribute(
          previousSelectedElement[0],
          'color',
          'warning'
        );
      }
    }
    let selectedElement = this.element.nativeElement.getElementsByClassName(
      'fhp-id-' + productId
    );
    if (selectedElement.length > 0) {
      this.renderer.setAttribute(selectedElement[0], 'color', 'tertiary');
    }
    if (this.previousSelectedFirstHalfProductId !== productId) {
      this.isSelectedFirstHalfSubProduct = false;
      let secondHalfPortionElement =
        this.element.nativeElement.getElementsByClassName(
          'second-half-portion'
        );
      if (secondHalfPortionElement.length > 0) {
        this.renderer.setAttribute(
          secondHalfPortionElement[0],
          'disabled',
          'true'
        );
      }
    }
    this.previousSelectedFirstHalfProductId = productId;
    this.firstHalfSubProducts = [];
    this.subProducts.forEach((element) => {
      if (element.foodItemId === productId) {
        this.firstHalfSubProducts.push(element);
      }
    });
    this.halfAndHalfDeals.firstHalf.product = product;
    setTimeout(async () => {
      this.isShowFirstHalfSubProduct = false;
      this.isShowFirstHalfProduct = true;
    }, 500);
  }

  secondHalfProduct(product) {
    let productId = product.foodItemId;
    if (this.previousSelectedSecondHalfProductId) {
      console.log('sh - productId: ', this.previousSelectedSecondHalfProductId);
      let previousSelectedElement =
        this.element.nativeElement.getElementsByClassName(
          'shp-id-' + this.previousSelectedSecondHalfProductId
        );
      if (previousSelectedElement.length > 0) {
        this.renderer.setAttribute(
          previousSelectedElement[0],
          'color',
          'warning'
        );
      }
    }
    let selectedElement = this.element.nativeElement.getElementsByClassName(
      'shp-id-' + productId
    );
    if (selectedElement.length > 0) {
      this.renderer.setAttribute(selectedElement[0], 'color', 'tertiary');
    }
    if (this.previousSelectedSecondHalfProductId !== productId) {
      this.isSelectedSecondHalfSubProduct = false;
      let confirmBtnElement =
        this.element.nativeElement.getElementsByClassName('confirm-btn');
      if (confirmBtnElement.length > 0) {
        this.renderer.setAttribute(confirmBtnElement[0], 'disabled', 'true');
      }
    }
    this.previousSelectedSecondHalfProductId = productId;
    this.secondHalfSubProducts = [];
    this.subProducts.forEach((element) => {
      if (element.foodItemId === productId) {
        this.secondHalfSubProducts.push(element);
      }
    });
    this.halfAndHalfDeals.secondHalf.product = product;
    setTimeout(async () => {
      this.isShowSecondHalfProduct = true;
      this.isShowSecondHalfSubProduct = false;
    }, 500);
  }

  firstHalfSubProduct(subProduct) {
    console.log('subProduct: ', subProduct);
    let subProductId = subProduct.selectiveItemId;
    let productId = subProduct.foodItemId;
    let categoryId = subProduct.categoryId;
    this.isSelectedFirstHalfSubProduct = true;
    if (this.previousSelectedFirstHalfSubProductId) {
      let previousSelectedElement =
        this.element.nativeElement.getElementsByClassName(
          'fhsp-id-' + this.previousSelectedFirstHalfSubProductId
        );
      if (previousSelectedElement.length > 0) {
        this.renderer.setAttribute(
          previousSelectedElement[0],
          'color',
          'medium'
        );
      }
    }
    let selectedElement = this.element.nativeElement.getElementsByClassName(
      'fhsp-id-' + subProductId
    );
    if (selectedElement.length > 0) {
      this.renderer.setAttribute(selectedElement[0], 'color', 'tertiary');
    }
    this.previousSelectedFirstHalfSubProductId = subProductId;
    this.selectedFirstHalfSubProductSizeId = subProduct.productSizeId;
    this.firstHalfAssignedModifiers =
      this.modifierService.getAssignedModifiersAsSubProduct(subProductId);
    if (this.firstHalfAssignedModifiers.length === 0) {
      this.firstHalfAssignedModifiers =
        this.modifierService.getAssignedModifiersAsProduct(productId);
    }
    if (this.firstHalfAssignedModifiers.length === 0) {
      this.firstHalfAssignedModifiers =
        this.modifierService.getAssignedModifiersAsProductCategory(categoryId);
    }
    console.log(
      'this.firstHalfAssignedModifiers: ',
      this.firstHalfAssignedModifiers
    );
    let secondHalfPortionElement =
      this.element.nativeElement.getElementsByClassName('second-half-portion');
    if (secondHalfPortionElement.length > 0) {
      this.renderer.setAttribute(
        secondHalfPortionElement[0],
        'disabled',
        'false'
      );
    }
    this.firstHalfSubProductText = subProduct.selectiveItemName;
    this.halfAndHalfDeals.firstHalf.subProduct = subProduct;
    this.halfAndHalfDeals.firstHalf.productText = this.firstHalfSubProductText;
    this.firstHalfSubProductPrice = parseFloat(subProduct.takeawayPrice);
    this.checkHighestPrice();
    setTimeout(async () => {
      this.isShowFirstHalfSubProduct = true;
      this.isShowFirstHalfModifier = false;
    }, 500);
  }

  secondHalfSubProduct(subProduct) {
    console.log('subProduct: ', subProduct);
    let subProductId = subProduct.selectiveItemId;
    let productId = subProduct.foodItemId;
    let categoryId = subProduct.categoryId;
    this.isSelectedSecondHalfSubProduct = true;
    if (this.previousSelectedSecondHalfSubProductId) {
      let previousSelectedElement =
        this.element.nativeElement.getElementsByClassName(
          'shsp-id-' + this.previousSelectedSecondHalfSubProductId
        );
      if (previousSelectedElement.length > 0) {
        this.renderer.setAttribute(
          previousSelectedElement[0],
          'color',
          'medium'
        );
      }
    }
    let selectedElement = this.element.nativeElement.getElementsByClassName(
      'shsp-id-' + subProductId
    );
    if (selectedElement.length > 0) {
      this.renderer.setAttribute(selectedElement[0], 'color', 'tertiary');
    }
    this.previousSelectedSecondHalfSubProductId = subProductId;
    let confirmBtnElement =
      this.element.nativeElement.getElementsByClassName('confirm-btn');
    if (confirmBtnElement.length > 0) {
      this.renderer.setAttribute(confirmBtnElement[0], 'disabled', 'false');
    }
    this.secondHalfAssignedModifiers =
      this.modifierService.getAssignedModifiersAsSubProduct(subProductId);
    if (this.secondHalfAssignedModifiers.length === 0) {
      this.secondHalfAssignedModifiers =
        this.modifierService.getAssignedModifiersAsProduct(productId);
    }
    if (this.secondHalfAssignedModifiers.length === 0) {
      this.secondHalfAssignedModifiers =
        this.modifierService.getAssignedModifiersAsProductCategory(categoryId);
    }

    this.secondHalfSubProductText = subProduct.selectiveItemName;
    this.halfAndHalfDeals.secondHalf.subProduct = subProduct;
    this.halfAndHalfDeals.secondHalf.productText =
      this.secondHalfSubProductText;
    this.secondHalfSubProductPrice = parseFloat(subProduct.takeawayPrice);
    this.checkHighestPrice();
    setTimeout(async () => {
      this.isShowSecondHalfSubProduct = true;
      this.isShowSecondHalfModifier = false;
    }, 500);
  }

  selectFirstHalfModifier($event, modifier, assignedModifier) {
    console.log('First Half modifier: ', modifier);
    let modifierUnitPrice = parseFloat(modifier.UnitPrice);
    if ($event.detail.checked) {
      let isAddAble = this.isAddAbleModifier(
        'firstHalf',
        modifier,
        assignedModifier
      );
      if (isAddAble) {
        this.firstHalfModifierPrice =
          this.firstHalfModifierPrice + modifierUnitPrice;
        modifier.quantity = 1;
        this.halfAndHalfDeals.firstHalf.modifiers.push(modifier);
      }
    } else {
      this.firstHalfModifierPrice =
        this.firstHalfModifierPrice - modifierUnitPrice;
      this.removeModifierFromHalfAndHalfDeal(
        'firstHalf',
        modifier.SideDishesId
      );
      this.removeSelectedModifiers('firstHalf', modifier, assignedModifier);
    }
    let modifierText = '';
    let count = 0;
    let modifierLength = this.halfAndHalfDeals.firstHalf.modifiers.length;
    if (modifierLength > 0) {
      this.halfAndHalfDeals.firstHalf.modifiers.forEach((mod) => {
        modifierText += mod.SideDishesName;
        count++;
        if (count < modifierLength) {
          modifierText += ' + ';
        } else {
          modifierText = ' (' + modifierText + ')';
        }
      });
      this.isSelectedFirstHalfModifier = true;
    } else {
      this.isSelectedFirstHalfModifier = false;
    }
    this.firstHalfTitleText = this.firstHalfSubProductText + modifierText;
    this.halfAndHalfDeals.firstHalf.productText = this.firstHalfTitleText;
    this.checkHighestPrice();
  }

  selectSecondHalfModfier($event, modifier, assignedModifier) {
    console.log('Second Half modifier: ', modifier);
    let modifierUnitPrice = parseFloat(modifier.UnitPrice);
    if ($event.detail.checked) {
      let isAddAble = this.isAddAbleModifier(
        'secondHalf',
        modifier,
        assignedModifier
      );
      if (isAddAble) {
        this.secondHalfModifierPrice =
          this.secondHalfModifierPrice + modifierUnitPrice;
        modifier.quantity = 1;
        this.halfAndHalfDeals.secondHalf.modifiers.push(modifier);
      }
    } else {
      this.secondHalfModifierPrice =
        this.secondHalfModifierPrice - modifierUnitPrice;
      this.removeModifierFromHalfAndHalfDeal(
        'secondHalf',
        modifier.SideDishesId
      );
      this.removeSelectedModifiers('secondHalf', modifier, assignedModifier);
    }
    let modifierText = '';
    let count = 0;
    let modifierLength = this.halfAndHalfDeals.secondHalf.modifiers.length;
    if (modifierLength > 0) {
      this.halfAndHalfDeals.secondHalf.modifiers.forEach((mod) => {
        modifierText = modifierText + mod.SideDishesName;
        count++;
        if (count < modifierLength) {
          modifierText += ' + ';
        } else {
          modifierText = ' (' + modifierText + ')';
        }
      });
      this.isSelectedSecondHalfModifier = true;
    } else {
      this.isSelectedSecondHalfModifier = false;
    }
    this.secondHalfTitleText = this.secondHalfSubProductText + modifierText;
    this.halfAndHalfDeals.secondHalf.productText = this.secondHalfTitleText;
    this.checkHighestPrice();
  }

  checkHighestPrice() {
    this.firstHalfTotalPrice =
      this.firstHalfSubProductPrice + this.firstHalfModifierPrice;
    this.secondHalfTotalPrice =
      this.secondHalfSubProductPrice + this.secondHalfModifierPrice;
    if (this.firstHalfTotalPrice > this.secondHalfTotalPrice) {
      this.finalPrice = this.firstHalfTotalPrice;
    } else {
      this.finalPrice = this.secondHalfTotalPrice;
    }
    this.halfAndHalfDeals.firstHalf.subProductPrice =
      this.firstHalfSubProductPrice.toFixed(2);
    this.halfAndHalfDeals.firstHalf.modifierPrice =
      this.firstHalfModifierPrice.toFixed(2);
    this.halfAndHalfDeals.firstHalf.totalPrice =
      this.firstHalfTotalPrice.toFixed(2);

    this.halfAndHalfDeals.secondHalf.subProductPrice =
      this.secondHalfSubProductPrice.toFixed(2);
    this.halfAndHalfDeals.secondHalf.modifierPrice =
      this.secondHalfModifierPrice.toFixed(2);
    this.halfAndHalfDeals.secondHalf.totalPrice =
      this.secondHalfTotalPrice.toFixed(2);
    this.halfAndHalfDeals.price = this.finalPrice.toFixed(2);
    console.log('this.finalPrice: ', this.finalPrice);
  }

  removeModifierFromHalfAndHalfDeal(portion, modifierId) {
    let modifierIndex = -1;
    modifierIndex = this.halfAndHalfDeals[portion].modifiers.findIndex(
      (element) => element.SideDishesId === modifierId
    );
    if (modifierIndex >= 0) {
      this.halfAndHalfDeals[portion].modifiers.splice(modifierIndex, 1);
    }
  }

  isAddAbleModifier(portion, modifier, assignedModifier) {
    console.log('this.withSelectedModifiers: ', this.withSelectedModifiers);
    let limit = parseInt(assignedModifier.limit);
    if (limit > 0) {
      if (this.withSelectedModifiers[portion].length > 0) {
        let modifierIndex = -1;
        modifierIndex = this.withSelectedModifiers[portion].findIndex(
          (element) =>
            element.ModifierCategoryId === assignedModifier.ModifierCategoryId
        );
        if (modifierIndex >= 0) {
          let selectedModifiers =
            this.withSelectedModifiers[portion][modifierIndex]
              .selectedModifiers;
          if (selectedModifiers.length === 1 && limit === 1) {
            this.withSelectedModifiers[portion][
              modifierIndex
            ].selectedModifiers = [modifier];
            let modifierCategoryId = modifier.ModifierCategoryId;
            let className = 'fhmc-id-' + modifierCategoryId;
            if (portion === 'secondHalf') {
              className = 'shmc-id-' + modifierCategoryId;
            }
            let checkBoxElement =
              this.element.nativeElement.getElementsByClassName(className);

            if (checkBoxElement.length > 0) {
              for (let i = 0; i < checkBoxElement.length; i++) {
                const checkBox = checkBoxElement[i];
                this.renderer.setAttribute(checkBox, 'checked', 'false');
              }
            }

            let modifierId = modifier.SideDishesId;
            let selectedClassName = 'fhm-id-' + modifierId;
            if (portion === 'secondHalf') {
              selectedClassName = 'shm-id-' + modifierId;
            }
            let selectedCheckBoxElement =
              this.element.nativeElement.getElementsByClassName(
                selectedClassName
              );
            if (selectedCheckBoxElement.length > 0) {
              this.renderer.setAttribute(
                selectedCheckBoxElement[0],
                'checked',
                'true'
              );
            }
            return true;
          } else {
            if (selectedModifiers.length < limit) {
              selectedModifiers.push(modifier);
              this.withSelectedModifiers[portion][
                modifierIndex
              ].selectedModifiers = selectedModifiers;
              return true;
            } else {
              let modifierId = modifier.SideDishesId;
              let className = 'fhm-id-' + modifierId;
              if (portion === 'secondHalf') {
                className = 'shm-id-' + modifierId;
              }
              let checkBoxElement =
                this.element.nativeElement.getElementsByClassName(className);
              if (checkBoxElement.length > 0) {
                this.renderer.setAttribute(
                  checkBoxElement[0],
                  'checked',
                  'false'
                );
              }
              this.showOverModifierLimitMessage(
                assignedModifier.ModifierCategoryName
              );
              return false;
            }
          }
        } else {
          this.withSelectedModifiers[portion].push({
            ModifierCategoryId: assignedModifier.ModifierCategoryId,
            ModifierCategoryName: assignedModifier.ModifierCategoryName,
            limit: assignedModifier.limit,
            selectedModifiers: [modifier],
          });
          return true;
        }
      } else {
        this.withSelectedModifiers[portion].push({
          ModifierCategoryId: assignedModifier.ModifierCategoryId,
          ModifierCategoryName: assignedModifier.ModifierCategoryName,
          limit: assignedModifier.limit,
          selectedModifiers: [modifier],
        });
        return true;
      }
    } else {
      return false;
    }
  }

  removeSelectedModifiers(portion, modifier, assignedModifier) {
    let limit = assignedModifier.limit;
    if (this.withSelectedModifiers[portion].length > 0) {
      let modifierIndex = -1;
      modifierIndex = this.withSelectedModifiers[portion].findIndex(
        (element) =>
          element.ModifierCategoryId === assignedModifier.ModifierCategoryId
      );
      if (modifierIndex >= 0) {
        let selectedModifiers =
          this.withSelectedModifiers[portion][modifierIndex].selectedModifiers;
        if (selectedModifiers.length > 0) {
          if (selectedModifiers.length === 1 && limit === 1) {
            this.withSelectedModifiers[portion].splice(modifierIndex, 1);
          } else {
            let selectedModifierIndex = -1;
            selectedModifierIndex = selectedModifiers.findIndex(
              (element) => element.SideDishesId === modifier.SideDishesId
            );
            if (selectedModifierIndex >= 0) {
              this.withSelectedModifiers[portion][
                modifierIndex
              ].selectedModifiers.splice(selectedModifierIndex, 1);
            }
          }
        }
      }
    }
    console.log('this.withSelectedModifiers: ', this.withSelectedModifiers);
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
}
