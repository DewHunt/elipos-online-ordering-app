import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss'],
})
export class RatingsComponent implements OnInit {
  @Input()
  rate: number;
  @Input('readonly')
  readonly: boolean;
  @Input()
  small: boolean;
  @Output()
  rateChange: EventEmitter<number> = new EventEmitter();
  hoverRate: number;
  isDisabled: boolean = false;

  constructor() {
    console.log('Ratings Component');
  }

  ngOnInit() {
    this.isDisabled = this.readonly;
  }

  onClick(rate) {
    console.log('rate: ', rate);
    this.rate = rate;
    this.rateChange.emit(this.rate);
  }

  writeValue(value: any): void {
    if (value !== undefined) {
      this.rate = value;
    }
  }

  registerOnTouched(fn: any): void {}
}
