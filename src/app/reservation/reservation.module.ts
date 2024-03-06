import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';

import { IonicModule } from '@ionic/angular';

import { ReservationPageRoutingModule } from './reservation-routing.module';

import { NgxStripeModule } from 'ngx-stripe';
import { ReservationSubmitMessageComponent } from './components/reservation-submit-message/reservation-submit-message.component';
import { ReservationPage } from './reservation.page';

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
    ReservationPageRoutingModule,
    SharedModule,
    NgxStripeModule.forRoot(publishable_key),
  ],
  declarations: [ReservationPage, ReservationSubmitMessageComponent],
  exports: [ReservationSubmitMessageComponent],
})
export class ReservationPageModule {}
