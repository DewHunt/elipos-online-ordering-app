import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { FreeItemsComponent } from './components/free-items/free-items.component';
import { HalfAndHalfComponent } from './components/half-and-half/half-and-half.component';
import { ProductModalComponent } from './components/product-modal/product-modal.component';

import { IonicModule } from '@ionic/angular';

import { MenuPageRoutingModule } from './menu-routing.module';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DailyOffersComponent } from './components/daily-offers/daily-offers.component';
import { DealsComponent } from './components/deals/deals.component';
import { ShopOpenCloseComponent } from './components/shop-open-close/shop-open-close.component';
import { MenuPage } from './menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MenuPageRoutingModule,
    SharedModule,
  ],
  declarations: [
    MenuPage,
    FreeItemsComponent,
    DealsComponent,
    ProductModalComponent,
    HalfAndHalfComponent,
    DailyOffersComponent,
    ShopOpenCloseComponent,
  ],
  exports: [
    FreeItemsComponent,
    DealsComponent,
    ProductModalComponent,
    HalfAndHalfComponent,
    DailyOffersComponent,
    ShopOpenCloseComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuPageModule {}
