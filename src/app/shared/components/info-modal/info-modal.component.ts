import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ButtonInterface, ContentInterface } from './../../../shared/models';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent implements OnInit {
  @Input() title: string;
  @Input() contents: ContentInterface[];
  @Input() actionButtons: ButtonInterface[];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  async dismiss(options?: any): Promise<boolean> {
    return await this.modalCtrl.dismiss(options);
  }
}
