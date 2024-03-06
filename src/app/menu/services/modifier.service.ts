import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModifierService {
  modifiersCategories: any;
  modifierShowSideDishes: any;
  modifierSideDishesAsModifierCategories: any;
  assignedShowSideDishes: any = [];

  constructor(private http: HttpClient) {}

  getAssignedShowSideDishesFromWeb(postData): Observable<any> {
    const url = `${environment.serviceUrl}modifiers/get_assigned_show_side_dish`;
    return this.http.post<any>(url, postData);
  }

  getAssignedShowSideDishes(
    categoryId,
    productId,
    subProductId,
    modifierCategoryId
  ) {
    let assignedShowSideDish: any;
    if (this.modifierShowSideDishes) {
      let index = -1;
      index = this.modifierShowSideDishes.findIndex(
        (element) =>
          element.SideDishId === modifierCategoryId &&
          element.CategoryId === subProductId &&
          element.ProductLevel === '3'
      );
      if (index < 0) {
        index = this.modifierShowSideDishes.findIndex(
          (element) =>
            element.SideDishId === modifierCategoryId &&
            element.CategoryId === productId &&
            element.ProductLevel === '2'
        );
      }
      if (index < 0) {
        index = this.modifierShowSideDishes.findIndex(
          (element) =>
            element.SideDishId === modifierCategoryId &&
            element.CategoryId === categoryId &&
            element.ProductLevel === '1'
        );
      }

      if (index >= 0) {
        assignedShowSideDish = this.modifierShowSideDishes[index];
      }
      return assignedShowSideDish;
    }
  }

  public getModifiersByCategoryId(allModifiers, categoryId) {
    let modifierIndex = -1;
    modifierIndex = allModifiers.findIndex(
      (element) => element.categoryId == categoryId
    );
    if (modifierIndex >= 0) {
      return allModifiers[modifierIndex].modifiers;
    } else {
      return null;
    }
  }

  getAssignedModifiersAsProductCategory(productCategoryId) {
    let modifiersAsCategory = [];
    if (this.modifierSideDishesAsModifierCategories) {
      for (let sideDishesAsModifierCategory of this
        .modifierSideDishesAsModifierCategories) {
        let ModifierCategoryId =
          sideDishesAsModifierCategory.ModifierCategoryId;
        if (this.modifierShowSideDishes) {
          let assignedSideDish = null;
          assignedSideDish = this.modifierShowSideDishes.find(function (
            showSideDish
          ) {
            return (
              showSideDish.SideDishId === ModifierCategoryId &&
              showSideDish.CategoryId === productCategoryId &&
              showSideDish.ProductLevel === '1'
            );
          });
          if (assignedSideDish) {
            let selectedSideDish = sideDishesAsModifierCategory;
            selectedSideDish.limit = assignedSideDish.ModifierLimit;
            selectedSideDish.freeLimit = assignedSideDish.hasOwnProperty(
              'FreeModifierLimit'
            )
              ? assignedSideDish.FreeModifierLimit
              : 0;
            selectedSideDish.SideDishes = selectedSideDish.SideDishes;
            modifiersAsCategory.push(selectedSideDish);
          }
        }
      }
    }
    return modifiersAsCategory;
  }

  getAssignedModifiersAsProduct(productId) {
    let modifiersAsCategory = [];
    if (this.modifierSideDishesAsModifierCategories) {
      for (let sideDishesAsModifierCategory of this
        .modifierSideDishesAsModifierCategories) {
        let ModifierCategoryId =
          sideDishesAsModifierCategory.ModifierCategoryId;
        if (this.modifierShowSideDishes) {
          let assignedSideDish = null;
          assignedSideDish = this.modifierShowSideDishes.find(function (
            showSideDish
          ) {
            return (
              showSideDish.SideDishId == ModifierCategoryId &&
              showSideDish.CategoryId == productId &&
              showSideDish.ProductLevel == '2'
            );
          });

          if (assignedSideDish) {
            let selectedSideDish = sideDishesAsModifierCategory;
            selectedSideDish.limit = assignedSideDish.ModifierLimit;
            selectedSideDish.freeLimit = assignedSideDish.hasOwnProperty(
              'FreeModifierLimit'
            )
              ? assignedSideDish.FreeModifierLimit
              : 0;
            selectedSideDish.SideDishes = selectedSideDish.SideDishes;

            modifiersAsCategory.push(selectedSideDish);
          }
        }
      }
    }
    return modifiersAsCategory;
  }

  getAssignedModifiersAsSubProduct(subProductId) {
    // console.log('subProductId: ', subProductId);
    let modifiersAsCategory = [];
    // console.log(
    //   'this.modifierSideDishesAsModifierCategories: ',
    //   this.modifierSideDishesAsModifierCategories
    // );

    if (this.modifierSideDishesAsModifierCategories) {
      for (let sideDishesAsModifierCategory of this
        .modifierSideDishesAsModifierCategories) {
        let ModifierCategoryId =
          sideDishesAsModifierCategory.ModifierCategoryId;

        if (this.modifierShowSideDishes) {
          let assignedSideDish = null;
          assignedSideDish = this.modifierShowSideDishes.find(function (
            showSideDish
          ) {
            return (
              showSideDish.SideDishId === ModifierCategoryId &&
              showSideDish.CategoryId === subProductId &&
              showSideDish.ProductLevel === '3'
            );
          });

          if (assignedSideDish) {
            // console.log('assignedSideDish: ', assignedSideDish);
            let selectedSideDish = sideDishesAsModifierCategory;
            selectedSideDish.limit = assignedSideDish.ModifierLimit;
            selectedSideDish.freeLimit = assignedSideDish.hasOwnProperty(
              'FreeModifierLimit'
            )
              ? assignedSideDish.FreeModifierLimit
              : 0;
            selectedSideDish.SideDishes = selectedSideDish.SideDishes;
            modifiersAsCategory.push(selectedSideDish);
          }
        }
      }
    }
    return modifiersAsCategory;
  }

  getProductLevelCategoryId(categoryId, productId, subProductId) {
    let level = 0;
    if (subProductId) {
      // as sub product wise modifier limit productLevel = 3
      level = 3;
      categoryId = subProductId;
    } else if (productId) {
      // as product wise modifier limit productLevel = 2
      level = 2;
      categoryId = productId;
    } else {
      // as category wise modifier limit productLevel = 2
      level = 1;
    }
    return {
      level: level,
      categoryId: categoryId,
    };
  }
}
