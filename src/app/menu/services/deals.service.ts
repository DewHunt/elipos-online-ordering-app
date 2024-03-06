import { Injectable } from '@angular/core';
import { ModifierService } from './modifier.service';

@Injectable({
  providedIn: 'root',
})
export class DealsService {
  baseDealItems: any = [];
  dealDetails: any = [];
  dealBasePrice: number = 0;
  itemElement: any;
  itemProducts = [];
  productText: string = null;
  dealModifiersExtraPrice: number = 0;
  isDealReadToCard: boolean = false;
  isItemCompleted: boolean = false;

  constructor(private modifierService: ModifierService) {}

  addDealsItem(dealItem, product, subProduct): boolean {
    let isAdded = false;
    let dealItemElementLimit = dealItem.limit;
    let modifierLimits: any;
    if (product == null && subProduct) {
      modifierLimits = this.getModifierLimitByDealItemSubProduct(
        dealItem.subProductAsModifierLimit,
        subProduct.selectiveItemId
      );
    } else if (subProduct == null && product) {
      modifierLimits = this.getModifierLimitByDealItemProduct(
        dealItem.productAsModifierLimit,
        product.foodItemId
      );
    }
    let productId = product ? product.foodItemId : '0';
    let subProductId = '0';
    if (subProduct) {
      subProductId = subProduct.selectiveItemId;
      productId = subProduct.foodItemId;
    }
    let itemElementId = dealItem.id + '-' + productId + '-' + subProductId;
    if (modifierLimits.limit > 0) {
      let productModifiers = this.getProductModifier(product, subProduct);
      if (productModifiers.length == 0) {
        modifierLimits.limit = 0;
      }
    }
    let itemElement = {
      id: itemElementId,
      product: product,
      subProduct: subProduct,
      modifiers: [],
      modifierLimit: modifierLimits.limit,
      freeModifierLimit: modifierLimits.freeLimit,
      productLimit: modifierLimits.productLimit,
      quantity: 1,
    };
    // let itemProducts: any[] = [];
    let itemProducts = new Array<any>();
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );
    let totalProductQty = 0;
    if (itemIndex >= 0) {
      // item is exit in itemIndex
      itemProducts = this.dealDetails[itemIndex].itemProducts;
      // check deals items limit
      totalProductQty = this.getTotalProductQuantity(itemProducts);
      if (totalProductQty < dealItemElementLimit) {
        // permission to add new item
        let elementIndex = this.findItemElementIndex(
          itemProducts,
          itemElementId
        );
        if (elementIndex >= 0) {
          // update item element of existing item
          let modifiers =
            this.dealDetails[itemIndex].itemProducts[elementIndex].modifiers;
          itemElement.modifiers = modifiers;
          this.dealDetails[itemIndex].itemProducts[elementIndex] = itemElement;
          isAdded = true;
        } else {
          // insert new item element for existing item
          itemProducts.push(itemElement);
          // reset new itemElement of exiting item
          let itemDetails = this.dealDetails[itemIndex];
          itemDetails.itemProducts = itemProducts;
          let productText = this.getItemsProductText(itemProducts);
          itemDetails.productText = productText;
          isAdded = true;
        }
      }
      if (totalProductQty == dealItemElementLimit) {
        this.isItemCompleted = true;
      }
    } else {
      // push new
      itemProducts.push(itemElement);
      let productText = this.getItemsProductText(itemProducts);
      this.dealDetails.push({
        id: dealItem.id,
        itemProducts: itemProducts,
        title: dealItem.title,
        description: dealItem.description,
        dealsId: dealItem.dealsId,
        productText: productText,
      });
      totalProductQty = this.getTotalProductQuantity(itemProducts);
      if (totalProductQty == dealItemElementLimit) {
        this.isItemCompleted = true;
      }
    }
    return isAdded;
  }

  getProductModifier(product, subProduct): any {
    let productModifier: any = [];
    if (product && subProduct === null) {
      productModifier = this.modifierService.getAssignedModifiersAsProduct(
        product.foodItemId
      );
      if (productModifier.length == 0) {
        productModifier =
          this.modifierService.getAssignedModifiersAsProductCategory(
            product.categoryId
          );
      }
    } else if (subProduct && product === null) {
      productModifier = this.modifierService.getAssignedModifiersAsSubProduct(
        subProduct.selectiveItemId
      );
      if (productModifier.length == 0) {
        productModifier = this.modifierService.getAssignedModifiersAsProduct(
          subProduct.foodItemId
        );
        if (productModifier.length == 0) {
          productModifier =
            this.modifierService.getAssignedModifiersAsProductCategory(
              subProduct.categoryId
            );
        }
      }
    }
    return productModifier;
  }

  getTotalProductQuantity(itemProduct: any = []) {
    let qty = 0;
    if (itemProduct.length > 0) {
      itemProduct.forEach(function (element) {
        qty = qty + element.quantity;
      });
      return qty;
    }
    return 0;
  }

  getDealsItemProductsById(dealItemId) {
    let itemProducts = [];
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItemId
    );
    if (itemIndex >= 0) {
      return this.dealDetails[itemIndex].itemProducts;
    }
    return itemProducts;
  }

  getItemProducts(dealItem) {
    let elementIndex = -1;
    let itemProducts = [];
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );
    if (itemIndex >= 0) {
      itemProducts = this.dealDetails[itemIndex].itemProducts;
    }
    return itemProducts;
  }

  getTotalModifier(modifiers) {
    let totalQty = 0;
    if (modifiers.length > 0) {
      if (Array.isArray(modifiers)) {
        modifiers.forEach(function (element) {
          totalQty = totalQty + element.quantity;
        });
      }
      return totalQty;
    }
    return totalQty;
  }

  isItemProductsModifierIsCompleted(dealItem) {
    let itemProducts = this.getItemProducts(dealItem);
    if (itemProducts.length > 0) {
      let isComplete = false;
      for (let element of itemProducts) {
        let countModifier = this.getTotalModifier(element.modifiers);
        if (element.modifierLimit == countModifier) {
          isComplete = true;
        } else {
          isComplete = false;
        }
      }
      return isComplete;
    }
    return false;
  }

  addProductQuantityInItemProduct(itemElementId: string, dealItem) {
    let elementIndex = -1;
    let itemProducts = [];
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );
    if (itemIndex >= 0) {
      itemProducts = this.dealDetails[itemIndex].itemProducts;
    }
    let totalQuantity = 0;
    if (itemProducts.length > 0) {
      let itemLimit = dealItem.limit;
      totalQuantity = this.getTotalProductQuantity(itemProducts);
      if (itemLimit > totalQuantity) {
        elementIndex = itemProducts.findIndex(
          (element) => element.id == itemElementId
        );
        if (elementIndex >= 0) {
          // increase quantity by one
          itemProducts[elementIndex].quantity += 1;
          this.dealDetails[itemIndex].itemProducts = itemProducts;
        }
      }
      totalQuantity = this.getTotalProductQuantity(itemProducts);
    }
    return totalQuantity;
  }

  totalProductQuantityInAItem(dealItem) {
    let itemProducts = [];
    let itemIndex = -1;
    let totalQuantity = 0;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );
    if (itemIndex >= 0) {
      itemProducts = this.dealDetails[itemIndex].itemProducts;
    }
    if (itemProducts.length > 0) {
      totalQuantity = this.getTotalProductQuantity(itemProducts);
    }
    return totalQuantity;
  }

  removeProductQuantityInItemProduct(
    itemElementId: string,
    dealItem,
    productLimit = 1
  ) {
    let elementIndex = -1;
    let itemProducts = [];
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );
    if (itemIndex >= 0) {
      itemProducts = this.dealDetails[itemIndex].itemProducts;
    }
    if (itemProducts.length > 0) {
      let itemLimit = dealItem.limit;
      let totalQuantity = this.getTotalProductQuantity(itemProducts);
      elementIndex = itemProducts.findIndex(
        (element) => element.id == itemElementId
      );
      if (elementIndex >= 0) {
        let currentQty = itemProducts[elementIndex].quantity;
        if (currentQty > 1) {
          // increase quantity by one
          itemProducts[elementIndex].quantity -= 1;
          this.dealDetails[itemIndex].itemProducts = itemProducts;
          totalQuantity = this.getTotalProductQuantity(itemProducts);
        }
      }
      if (itemLimit > totalQuantity) {
        // show product is incomplete
      }
    }
  }

  setItemsProductEmptyByItemId(dealItem) {
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );
    if (itemIndex >= 0) {
      // remove dealsItem
      this.dealDetails[itemIndex].itemProducts = [];
    }
  }

  removeDealsItem(dealItem, productId, subProductId): boolean {
    let isRemoved = false;
    let id = dealItem.id + '-' + productId + '-' + subProductId;
    let itemIndex = -1;
    itemIndex = this.dealDetails.findIndex(
      (element) => element.id == dealItem.id
    );

    if (itemIndex >= 0) {
      // remove dealsItem
      let itemProducts = this.dealDetails[itemIndex].itemProducts;

      if (itemProducts) {
        let elementIndex = this.findItemElementIndex(itemProducts, id);
        if (elementIndex >= 0) {
          itemProducts.splice(elementIndex, 1);
          this.dealDetails[itemIndex].itemProducts = itemProducts;
        }
        if (itemProducts.length <= 0) {
          this.dealDetails.splice(itemIndex, 1);
        }
        isRemoved = true;
        this.isItemCompleted = false;
      }
    }
    return isRemoved;
  }

  addItemElementModifier(dealItem, productId, subProductId, modifier): boolean {
    let isAdded = false;
    let itemIndex = this.findDealItemIndex(dealItem);
    if (itemIndex >= 0) {
      let itemElementId = dealItem.id + '-' + productId + '-' + subProductId;
      let itemProducts = this.dealDetails[itemIndex].itemProducts;
      let itemElementIndex = this.findItemElementIndex(
        itemProducts,
        itemElementId
      );
      if (itemElementIndex >= 0) {
        // add modifier
        // check modifier
        let modifiers = itemProducts[itemElementIndex].modifiers;
        let sideDishId = modifier.SideDishesId;
        let newModifier = {
          ModifierCategoryId: modifier.ModifierCategoryId,
          SideDishesId: modifier.SideDishesId,
          SideDishesName: modifier.SideDishesName,
          UnitPrice: modifier.UnitPrice,
          quantity: 1,
        };
        if (modifiers.length > 0) {
          let itemElementModifierIndex = this.findItemElementModifierIndex(
            modifiers,
            sideDishId
          );
          if (itemElementModifierIndex >= 0) {
            // increase quantity
            isAdded = true;
            let prevQty = modifiers[itemElementModifierIndex].quantity;
            modifiers[itemElementModifierIndex].quantity = prevQty + 1;
          } else {
            isAdded = true;
            modifiers.push(newModifier);
          }
        } else {
          isAdded = true;
          modifiers.push(newModifier);
        }
        this.dealDetails[itemIndex].itemProducts[itemElementIndex].modifiers =
          modifiers;
      }
    }
    return isAdded;
  }

  removeItemElementModifier(
    dealItem,
    productId,
    subProductId,
    modifier
  ): boolean {
    let isRemoved = false;
    let itemIndex = this.findDealItemIndex(dealItem);
    if (itemIndex >= 0) {
      let itemElementId = dealItem.id + '-' + productId + '-' + subProductId;

      let itemProducts = this.dealDetails[itemIndex].itemProducts;
      let itemElementIndex = this.findItemElementIndex(
        itemProducts,
        itemElementId
      );
      if (itemElementIndex >= 0) {
        let modifierUniqueId = modifier.SideDishesId;
        let modifiers = itemProducts[itemElementIndex].modifiers;
        let modifierUnitPrice = modifier.UnitPrice;
        let itemElementModifierIndex = this.findItemElementModifierIndex(
          modifiers,
          modifierUniqueId
        );
        if (itemElementModifierIndex >= 0) {
          // decrease quantity by one
          let prevQty = modifiers[itemElementModifierIndex].quantity;
          if (prevQty >= 1) {
            if (prevQty == 1) {
              modifiers.splice(itemElementModifierIndex, 1);
            } else {
              modifiers[itemElementModifierIndex].quantity = prevQty - 1;
            }
            // this.dealModifiersExtraPrice-=1*modifierUnitPrice;
            isRemoved = true;
          }
        }
        this.dealDetails[itemIndex].itemProducts[itemElementIndex].modifiers =
          modifiers;
      }
    }
    return isRemoved;
  }

  setEmptyModifiersInElementItem(identity, dealItem) {
    let itemIndex = this.findDealItemIndex(dealItem);
    if (itemIndex >= 0) {
      let itemProducts = this.dealDetails[itemIndex].itemProducts;
      let itemElementIndex = this.findItemElementIndex(itemProducts, identity);
      if (itemElementIndex >= 0) {
        this.dealDetails[itemIndex].itemProducts[itemElementIndex].modifiers =
          [];
        return true;
      }
    }
    return false;
  }

  getItemElementModifier(dealItem, productId, subProductId, modifierId) {
    let modifier = null;
    let itemIndex = this.findDealItemIndex(dealItem);

    if (itemIndex >= 0) {
      let itemElementId = dealItem.id + '-' + productId + '-' + subProductId;
      let itemProducts = this.dealDetails[itemIndex].itemProducts;
      let itemElementIndex = this.findItemElementIndex(
        itemProducts,
        itemElementId
      );
      if (itemElementIndex >= 0) {
        let modifiers = itemProducts[itemElementIndex].modifiers;
        let itemElementModifierIndex = this.findItemElementModifierIndex(
          modifiers,
          modifierId
        );
        if (itemElementModifierIndex >= 0) {
          modifier = modifiers[itemElementModifierIndex];
        }
      }
    }
    return modifier;
  }

  getTotalAddedModifierQuantity(dealItem, productId, subProductId) {
    let modifier = null;
    let itemIndex = this.findDealItemIndex(dealItem);
    if (itemIndex >= 0) {
      let itemElementId = dealItem.id + '-' + productId + '-' + subProductId;

      let itemProducts = this.dealDetails[itemIndex].itemProducts;
      let itemElementIndex = this.findItemElementIndex(
        itemProducts,
        itemElementId
      );
      if (itemElementIndex >= 0) {
        // add modifier
        // check modifier
        let modifiers = itemProducts[itemElementIndex].modifiers;

        if (modifiers.length > 0) {
          let quantity = 0;
          if (Array.isArray(modifiers)) {
            modifiers.forEach(function (element) {
              quantity = quantity + element.quantity;
            });
          }
          return quantity;
        }
        return 0;
      }
    }
    return 0;
  }

  getTotalSelectedModifierQuantity(
    dealItem,
    productId,
    subProductId,
    modifierCategoryId
  ) {
    console.log('Get Total Selected Modifier Quantity');
    let itemIndex = this.findDealItemIndex(dealItem);
    if (itemIndex >= 0) {
      let itemElementId = dealItem.id + '-' + productId + '-' + subProductId;

      let itemProducts = this.dealDetails[itemIndex].itemProducts;
      let itemElementIndex = this.findItemElementIndex(
        itemProducts,
        itemElementId
      );
      if (itemElementIndex >= 0) {
        // add modifier
        // check modifier
        let modifiers = itemProducts[itemElementIndex].modifiers;

        if (modifiers.length > 0) {
          let quantity = 0;
          if (Array.isArray(modifiers)) {
            modifiers.forEach(function (element) {
              if (element.ModifierCategoryId === modifierCategoryId) {
                quantity = quantity + element.quantity;
              }
            });
          }
          return quantity;
        }
        return 0;
      }
    }
    return 0;
  }

  findDealItemIndex(dealItem) {
    return this.dealDetails.findIndex((element) => element.id == dealItem.id);
  }

  findItemElementIndex(itemProducts, id) {
    let index: any;
    if (itemProducts) {
      index = itemProducts.findIndex((element) => element.id == id);
    }
    return index;
  }

  findItemElementModifierIndex(itemProductsModifiers, id) {
    let index = -1;
    if (itemProductsModifiers.length > 0) {
      index = itemProductsModifiers.findIndex(
        (element) => element.SideDishesId === id
      );
    }
    return index;
  }

  isDealIsCompleted(dealsDetails) {
    let i: number = 0;
    for (i = 0; i < dealsDetails.length; i++) {
      let dealsItem = dealsDetails[i];
      let limit = dealsItem.limit;
      let itemProducts = this.getDealsItemProductsById(dealsItem.id);
      let totalItemLimit = this.getTotalProductQuantity(itemProducts);
      if (limit != totalItemLimit) {
        return false;
      }
    }
    return true;
  }

  getProductText() {
    let productText: string = '';
    for (let dealItem of this.dealDetails) {
      for (let itemElement of dealItem.itemProducts) {
        if (itemElement.subProduct) {
          productText += productText
            ? '+' + itemElement.subProduct.selectiveItemName
            : itemElement.subProduct.selectiveItemName;
        } else if (itemElement.product) {
          productText += productText
            ? '+' + itemElement.product.foodItemName
            : itemElement.product.foodItemName;
        }
      }
    }
    return productText;
  }

  getItemsProductText(itemDetails) {
    let productText: string = '';
    for (let item of itemDetails) {
      if (item.subProduct) {
        productText += productText
          ? '+' + item.subProduct.selectiveItemName
          : item.subProduct.selectiveItemName;
      } else if (item.product) {
        productText += productText
          ? '+' + item.product.foodItemName
          : item.product.foodItemName;
      }
    }
    return productText;
  }

  getModifierLimitByDealItemProduct(productAsModifierLimit, productId) {
    if (typeof productAsModifierLimit == 'string') {
      productAsModifierLimit = JSON.parse(productAsModifierLimit);
    }

    if (productAsModifierLimit) {
      let modifierLimitIndex = -1;
      modifierLimitIndex = productAsModifierLimit.findIndex(
        (element) => element.id == productId
      );

      if (modifierLimitIndex >= 0) {
        let modifierLimit = productAsModifierLimit[modifierLimitIndex];
        return {
          limit: modifierLimit.limit,
          freeLimit: modifierLimit.hasOwnProperty('freeLimit')
            ? modifierLimit.freeLimit
            : 0,
          productLimit: modifierLimit.hasOwnProperty('productLimit')
            ? modifierLimit.productLimit
            : 1,
        };
      }
      return {
        limit: 0,
        freeLimit: 0,
        productLimit: 1,
      };
    }
    return {
      limit: 0,
      freeLimit: 0,
      productLimit: 1,
    };
  }

  getModifierLimitByDealItemSubProduct(
    subProductAsModifierLimit,
    subProductId
  ) {
    if (typeof subProductAsModifierLimit == 'string') {
      subProductAsModifierLimit = JSON.parse(subProductAsModifierLimit);
    }

    if (subProductAsModifierLimit) {
      let modifierLimitIndex = -1;
      modifierLimitIndex = subProductAsModifierLimit.findIndex(
        (element) => element.id == subProductId
      );
      if (modifierLimitIndex >= 0) {
        let modifierLimit = subProductAsModifierLimit[modifierLimitIndex];

        return {
          limit: modifierLimit.limit,
          freeLimit: modifierLimit.hasOwnProperty('freeLimit')
            ? modifierLimit.freeLimit
            : 0,
          productLimit: modifierLimit.hasOwnProperty('productLimit')
            ? modifierLimit.productLimit
            : 1,
        };
      }
      return {
        limit: 0,
        freeLimit: 0,
        productLimit: 1,
      };
    }
    return {
      limit: 0,
      freeLimit: 0,
      productLimit: 1,
    };
  }

  getModifiersTotalPrice() {
    let modifierPrice: number = 0;
    if (this.dealDetails.length > 0) {
      for (let items of this.dealDetails) {
        let itemProducts = items.itemProducts;
        for (let item of itemProducts) {
          let modifiers = item.modifiers;
          let freeModifierLimit = item.freeModifierLimit;
          let unitPrice = 0;
          if (modifiers.length > 0) {
            let totalModifier = 0;
            for (let modifier of modifiers) {
              totalModifier = totalModifier + modifier.quantity;
              unitPrice = modifier.UnitPrice;
            }
            if (totalModifier > freeModifierLimit) {
              modifierPrice += (totalModifier - freeModifierLimit) * unitPrice;
            }
          }
        }
      }
    }

    this.dealModifiersExtraPrice = modifierPrice;
    return modifierPrice;
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

  getInCompleteDealsItems() {
    let i = 0;
    let items = [];
    let dealsDetails = this.baseDealItems;
    if (dealsDetails.length > 0) {
      for (i = 0; i < dealsDetails.length; i++) {
        let dealsItem = dealsDetails[i];
        let limit = dealsItem.limit;
        let itemProducts = this.getDealsItemProductsById(dealsItem.id);
        let totalItemLimit = this.getTotalProductQuantity(itemProducts);
        if (limit != totalItemLimit) {
          items.push(dealsItem);
        }
      }
      return items;
    }
    return items;
  }
}
