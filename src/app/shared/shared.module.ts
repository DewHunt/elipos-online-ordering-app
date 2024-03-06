import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ErrorModalComponent } from './components/error-modal/error-modal.component';
import { InfoModalComponent } from './components/info-modal/info-modal.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ProductPricePipe } from './pipes/product-price.pipe';
import { SafePipe } from './pipes/safe.pipe';

const SHARED_PIPES = [SafePipe, ProductPricePipe, DateFormatPipe];
const SHARED_COMPONENT = [InfoModalComponent, ErrorModalComponent];

@NgModule({
  declarations: [...SHARED_COMPONENT, ...SHARED_PIPES],
  exports: [...SHARED_COMPONENT, ...SHARED_PIPES],
  providers: [...SHARED_PIPES],
  imports: [CommonModule, IonicModule.forRoot()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
