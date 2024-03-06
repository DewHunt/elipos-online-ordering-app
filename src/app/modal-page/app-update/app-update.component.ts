import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-app-update',
  templateUrl: './app-update.component.html',
  styleUrls: ['./app-update.component.scss'],
})
export class AppUpdateComponent implements OnInit {
  updateLink: string;
  updateMessage: string;

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

  update() {
    console.log('Update Method');
    console.log('this.updateLink: ', this.updateLink);
    window.open(this.updateLink, '_system');
  }
}
