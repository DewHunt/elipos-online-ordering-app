import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productPrice',
})
export class ProductPricePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    let price = parseFloat(value);
    return '£ ' + price.toFixed(2);
  }
}
