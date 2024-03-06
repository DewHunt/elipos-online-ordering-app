import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelpsPageRoutingModule } from './helps-routing.module';

import { SharedModule } from '../shared/shared.module';
import { HelpsPage } from './helps.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HelpsPageRoutingModule,
    SharedModule,
  ],
  declarations: [HelpsPage],
})
export class HelpsPageModule {}
