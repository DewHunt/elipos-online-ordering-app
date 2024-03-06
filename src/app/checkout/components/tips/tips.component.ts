import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss'],
})
export class TipsComponent implements OnInit {
  tipsData: any;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    console.log('this.tipsData: ', this.tipsData);
  }

  closeModal() {
    this.modalController.dismiss(
      { tipsAmount: 0, processStatus: false },
      'cancle'
    );
  }

  withoutTipsAmount() {
    this.modalController.dismiss(
      { tipsAmount: 0, processStatus: true },
      'cancle'
    );
  }

  withTipsAmount(tipsAmount) {
    this.modalController.dismiss(
      { tipsAmount: tipsAmount, processStatus: true },
      'cancle'
    );
  }
}
