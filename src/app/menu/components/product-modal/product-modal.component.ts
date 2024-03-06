import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {
  public form: FormGroup;
  @ViewChild('footer', { read: ElementRef }) footer: ElementRef;
  // @ViewChild('comment', { read: ElementRef }) comment: ElementRef;
  @ViewChild('comment') comment: any;
  @ViewChild('comment_block', { read: ElementRef }) commentBlock: ElementRef;
  @ViewChild('header_block', { read: ElementRef }) headerBlock: ElementRef;
  @ViewChild('option_grid_block', { read: ElementRef })
  optionGridBlock: ElementRef;
  product: any;
  subProduct: any;
  category: any;
  sideDishes: any;
  sideDishesAsModifierCategory: any;
  withOptions = [];
  withOptionsAsModifierCategory = [];
  withOutOptions = [];
  commentInFooterFixed: boolean = false;

  constructor(
    private element: ElementRef,
    private toast: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // console.log('this.product: ', this.product);
    // console.log('this.subProduct: ', this.subProduct);

    this.withOptionsAsModifierCategory = [];
    // dynamic options form fields
    const formGroup = {};

    if (this.sideDishesAsModifierCategory) {
      for (let i = 0; i < this.sideDishesAsModifierCategory.length; i = i + 1) {
        let sideDishes = this.sideDishesAsModifierCategory[i].SideDishes;
        for (let sideDish of sideDishes) {
          const formGroupSub = {};
          let id = sideDish.SideDishesId;
          formGroupSub['with-' + id] = new FormControl(false);
          //formGroupSub['without-'+id]= new FormControl(false);
          formGroup[id] = new FormGroup(formGroupSub);
        }
      }
      this.form = new FormGroup(formGroup);
    }
  }

  ionViewDidEnter() {
    if (this.sideDishesAsModifierCategory.length > 0) {
      let totalPageHeight = this.element.nativeElement.offsetHeight;
      let header = this.headerBlock.nativeElement.offsetHeight;
      let optionGrid = this.optionGridBlock.nativeElement.offsetHeight;
      let commentBlockHtml = this.commentBlock.nativeElement.offsetHeight;
      let totalOffset = header + optionGrid + commentBlockHtml;
      // console.log('totalPageHeight: ', totalPageHeight);
      // console.log('totalOffset: ', totalOffset);

      // console.log(totalOffset+'-'+totalPageHeight);
      if (totalOffset >= totalPageHeight) {
        this.commentInFooterFixed = true;
      } else {
        this.commentInFooterFixed = false;
      }
    }
  }

  ionViewWillEnter() {
    if (this.sideDishesAsModifierCategory.length > 0) {
      for (let i = 0; i < this.sideDishesAsModifierCategory.length; i = i + 1) {
        let sideDishes = this.sideDishesAsModifierCategory[i].SideDishes;
        for (let sideDish of sideDishes) {
          const formGroupSub = {};
        }
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  withOutOption($event, sideDish, sideDishAsModifierCategory) {
    let itemIndex = -1;
    itemIndex = this.withOutOptions.findIndex(
      (element) => element.SideDishesId === sideDish.SideDishesId
    );
    if ($event.detail.checked) {
      //this.removeWithOptionAsModifierCategory($event,sideDish,sideDishAsModifierCategory);
      if (itemIndex < 0) {
        this.withOutOptions.push(sideDish);
      }

      let sideDishId: string = sideDish.SideDishesId.toString();
      if (this.form.get(sideDishId).get('with-' + sideDishId).value) {
        this.form
          .get(sideDishId)
          .get('with-' + sideDishId)
          .setValue(false);
      }
    } else {
      if (itemIndex >= 0) {
        this.withOutOptions.splice(itemIndex, 1);
      }
    }
  }

  withOption($event, sideDish, sideDishAsModifierCategory) {
    let itemIndex = -1;
    itemIndex = this.withOptions.findIndex(
      (element) => element.SideDishesId === sideDish.SideDishesId
    );
    // this.showOptionLimitIsOverMessage(sideDish,sideDishAsModifierCategory);
    // console.log('sideDishAsModifierCategory: ', sideDishAsModifierCategory);
    if ($event.detail.checked) {
      let isAddAble = false;
      isAddAble = this.addWithOptionAsModifierCategory(
        $event,
        sideDish,
        sideDishAsModifierCategory
      );

      let sideDishId: string = sideDish.SideDishesId.toString();
      if (isAddAble) {
        if (itemIndex < 0) {
          this.withOptions.push(sideDish);
        }
        // if (this.form.get(sideDishId).get('without-' + sideDishId).value) {
        //   this.form
        //     .get(sideDishId)
        //     .get('without-' + sideDishId)
        //     .setValue(false);
        // }
        // console.log('this.withOptions: ', this.withOptions);
      } else {
        this.form
          .get(sideDishId)
          .get('with-' + sideDishId)
          .setValue(false);
      }
    } else {
      // console.log("unchecked");
      if (itemIndex >= 0) {
        this.withOptions.splice(itemIndex, 1);
        this.removeWithOptionAsModifierCategory(
          $event,
          sideDish,
          sideDishAsModifierCategory
        );
      }
    }
  }

  removeWithOptionAsModifierCategory(
    $event,
    sideDish,
    sideDishAsModifierCategory
  ) {
    let limit = sideDishAsModifierCategory.limit;
    if (this.withOptionsAsModifierCategory.length > 0) {
      let modifierCateIndex = -1;
      modifierCateIndex = this.withOptionsAsModifierCategory.findIndex(
        (element) =>
          element.ModifierCategoryId ===
          sideDishAsModifierCategory.ModifierCategoryId
      );
      if (modifierCateIndex >= 0) {
        let withOptions =
          this.withOptionsAsModifierCategory[modifierCateIndex].withOptions;
        if (withOptions.length > 0) {
          if (withOptions.length == 1 && limit == 1) {
            this.withOptionsAsModifierCategory.splice(modifierCateIndex, 1);
            this.removeWithOptions(sideDish.SideDishesId);
            let sideDishId: string = sideDish.SideDishesId.toString();
            this.form
              .get(sideDishId)
              .get('with-' + sideDishId)
              .setValue(false);
          } else {
            let modifierIndex = -1;
            modifierIndex = withOptions.findIndex(
              (element) => element.SideDishesId === sideDish.SideDishesId
            );
            if (modifierIndex >= 0) {
              this.withOptionsAsModifierCategory[
                modifierCateIndex
              ].withOptions.splice(modifierIndex, 1);
            }
          }
        }
      }
    }
  }

  removeWithOptions(sideDishId) {
    let sideDishIdIndex = -1;
    // console.log("remove " + sideDishId);

    sideDishIdIndex = this.withOptions.findIndex(
      (element) => element.SideDishesId === sideDishId
    );
    // console.log(this.withOptions);
    // console.log("remove Side Dishes index " + sideDishIdIndex);
    if (sideDishIdIndex >= 0) {
      this.withOptions.splice(sideDishIdIndex, 1);
    }
  }

  addWithOptionAsModifierCategory(
    $event,
    sideDish,
    sideDishAsModifierCategory
  ) {
    let limit = parseInt(sideDishAsModifierCategory.limit);

    if (limit > 0) {
      if (this.withOptionsAsModifierCategory.length > 0) {
        let modifierCateIndex = -1;
        modifierCateIndex = this.withOptionsAsModifierCategory.findIndex(
          (element) =>
            element.ModifierCategoryId ===
            sideDishAsModifierCategory.ModifierCategoryId
        );
        if (modifierCateIndex >= 0) {
          let withOptions =
            this.withOptionsAsModifierCategory[modifierCateIndex].withOptions;

          if (withOptions.length === 1 && limit === 1) {
            let sideDishPrev = withOptions[0];
            this.withOptionsAsModifierCategory[modifierCateIndex].withOptions =
              [];
            let sideDishId: string = sideDishPrev.SideDishesId.toString();

            this.removeWithOptions(sideDishId);
            this.form
              .get(sideDishId)
              .get('with-' + sideDishId)
              .setValue(false);
            this.withOptionsAsModifierCategory[
              modifierCateIndex
            ].withOptions.push(sideDish);
            return true;
          } else {
            if (withOptions.length < limit) {
              withOptions.push(sideDish);
              this.withOptionsAsModifierCategory[
                modifierCateIndex
              ].withOptions = withOptions;
              return true;
            } else {
              this.showOptionLimitIsOverMessage(
                sideDish,
                sideDishAsModifierCategory
              );
              return false;
            }
          }
        } else {
          this.withOptionsAsModifierCategory.push({
            ModifierCategoryId: sideDishAsModifierCategory.ModifierCategoryId,
            ModifierCategoryName:
              sideDishAsModifierCategory.ModifierCategoryName,
            limit: sideDishAsModifierCategory.limit,
            withOptions: [sideDish],
          });
          // console.log(
          //   'this.withOptionsAsModifierCategory: ',
          //   this.withOptionsAsModifierCategory
          // );
          return true;
        }
      } else {
        this.withOptionsAsModifierCategory.push({
          ModifierCategoryId: sideDishAsModifierCategory.ModifierCategoryId,
          ModifierCategoryName: sideDishAsModifierCategory.ModifierCategoryName,
          limit: sideDishAsModifierCategory.limit,
          withOptions: [sideDish],
        });
        // console.log(
        //   'this.withOptionsAsModifierCategory: ',
        //   this.withOptionsAsModifierCategory
        // );
        return true;
      }
    } else {
      return false;
    }
  }

  async showOptionLimitIsOverMessage(sideDish, sideDishAsModifierCategory) {
    // console.log(sideDishAsModifierCategory);
    let limit = sideDishAsModifierCategory.limit;
    if (this.withOptionsAsModifierCategory.length > 0) {
      let modifierCateIndex = -1;
      modifierCateIndex = this.withOptionsAsModifierCategory.findIndex(
        (element) =>
          element.ModifierCategoryId ===
          sideDishAsModifierCategory.ModifierCategoryId
      );
      if (modifierCateIndex >= 0) {
        let withOptions =
          this.withOptionsAsModifierCategory[modifierCateIndex].withOptions;
        if (withOptions.length == limit && limit != 1) {
          const toast = await this.toast.create({
            message:
              sideDishAsModifierCategory.ModifierCategoryName +
              '! Modifier Limit is Over',
            duration: 1500,
            position: 'middle',
            cssClass: 'text-center',
          });

          toast.onDidDismiss().then(() => {});
          toast.present();
        }
      }
    }
  }

  addItem() {
    let category = this.category;
    let product = this.product;
    let comment = this.comment.value;
    let options = { with: this.withOptions, without: this.withOutOptions };
    let data = {
      product: product,
      subProduct: this.subProduct,
      category: category,
      options: options,
      comment: comment,
    };
    this.modalController.dismiss(data);
  }
}
