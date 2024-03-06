import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedbackPageRoutingModule } from './feedback-routing.module';

import { SharedModule } from '../shared/shared.module';
import { AddFeedbackComponent } from './components/add-feedback/add-feedback.component';
import { RatingsComponent } from './components/ratings/ratings.component';
import { FeedbackPage } from './feedback.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FeedbackPageRoutingModule,
    SharedModule,
  ],
  declarations: [FeedbackPage, AddFeedbackComponent, RatingsComponent],
  exports: [AddFeedbackComponent, RatingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeedbackPageModule {}
