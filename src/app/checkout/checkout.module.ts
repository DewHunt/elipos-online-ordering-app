import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { TipsComponent } from './components/tips/tips.component';

import { IonicModule } from '@ionic/angular';

import { CheckoutPageRoutingModule } from './checkout-routing.module';

import { NgxStripeModule } from 'ngx-stripe';
import { CheckoutPage } from './checkout.page';
import { OrderSubmitMessageComponent } from './components/order-submit-message/order-submit-message.component';

let shopInfo = JSON.parse(localStorage.getItem('shopInfo') || '{}');
let publishable_key = '';
if (shopInfo) {
  publishable_key = shopInfo.payment_gateway.stripe.publishable_key;
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CheckoutPageRoutingModule,
    SharedModule,
    NgxStripeModule.forRoot(publishable_key),
  ],
  declarations: [CheckoutPage, OrderSubmitMessageComponent, TipsComponent],
  exports: [OrderSubmitMessageComponent, TipsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CheckoutPageModule {}
