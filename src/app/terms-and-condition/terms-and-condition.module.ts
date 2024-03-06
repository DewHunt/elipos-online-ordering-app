import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsAndConditionPageRoutingModule } from './terms-and-condition-routing.module';

import { SharedModule } from '../shared/shared.module';
import { TermsAndConditionPage } from './terms-and-condition.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsAndConditionPageRoutingModule,
    SharedModule,
  ],
  declarations: [TermsAndConditionPage],
})
export class TermsAndConditionPageModule {}
