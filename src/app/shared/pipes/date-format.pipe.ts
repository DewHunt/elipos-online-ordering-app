import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
  override transform(value: any, args: string): any {
    let newValue = value.replace(' ', 'T');
    return super.transform(newValue, args);
  }
}
