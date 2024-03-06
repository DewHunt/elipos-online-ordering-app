import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ButtonInterface, ContentInterface } from './../../../shared/models';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent implements OnInit {
  @Input() title: string;
  @Input() contents: ContentInterface[];
  @Input() actionButtons: ButtonInterface[];
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  async dismiss(options?: any): Promise<boolean> {
    return await this.modalCtrl.dismiss(options);
  }
}
